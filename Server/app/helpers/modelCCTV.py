import cv2
import os
import json
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
from typing import List, Dict, Tuple, Optional
from app.DB.mongodb import mongodb_client
from app.helpers.emailSend import send_email


from inference_sdk import InferenceHTTPClient

class VideoObjectDetection:
    api_url = "https://detect.roboflow.com"
    api_key = "oWW9w4FYndkZO5g4VTUE"  # Replace with your actual API key
    model_id = "ppe-rqnu9/4"
    client = InferenceHTTPClient(api_url=api_url, api_key=api_key)

    @staticmethod
    def resize_frame(frame, max_width=480, max_height=320) -> cv2.Mat:
        height, width = frame.shape[:2]
        if width > max_width or height > max_height:
            scaling_factor = min(max_width / width, max_height / height)
            frame = cv2.resize(frame, (int(width * scaling_factor), int(height * scaling_factor)))
        return frame

    @staticmethod
    def process_frame(frame: cv2.Mat, prediction_classes: List[str]) -> Tuple[Optional[cv2.Mat], Dict]:
        if frame is None or frame.size == 0:
            print("Error: Received an empty frame.")
            return None, {}

        try:
            frame = VideoObjectDetection.resize_frame(frame)
            result = VideoObjectDetection.client.infer(frame, model_id=VideoObjectDetection.model_id)
            print(result)  # For debugging

            predictions = result.get("predictions", [])
            results = {
                "total_persons": 0,
                "persons": {}
            }
            person_counter = 1

            for detection in predictions:
                if detection['class'] == 'Person':
                    person_box = {
                        "x_min": detection['x'] - detection['width'] / 2,
                        "x_max": detection['x'] + detection['width'] / 2,
                        "y_min": detection['y'] - detection['height'] / 2,
                        "y_max": detection['y'] + detection['height'] / 2
                    }

                    safety_gear = VideoObjectDetection.analyze_safety_gear(predictions, person_box, prediction_classes)

                    if any(not safety_gear[cls] for cls in prediction_classes):  # Check if at least one required class is False
                        results["total_persons"] += 1
                        results["persons"][f"Person {person_counter}"] = {
                            "safety_gear": safety_gear
                        }
                    person_counter += 1

            VideoObjectDetection.draw_bounding_boxes(frame, predictions)
            return frame, results

        except Exception as e:
            print(f"Error processing frame: {e}")
            return None, {}

    @staticmethod
    def draw_bounding_boxes(image: cv2.Mat, predictions: List[Dict]) -> None:
        for prediction in predictions:
            x = int(prediction['x'])
            y = int(prediction['y'])
            width = int(prediction['width'])
            height = int(prediction['height'])
            class_name = prediction['class']
            confidence = prediction['confidence']

            top_left = (x - width // 2, y - height // 2)
            bottom_right = (x + width // 2, y + height // 2)

            # Draw bounding box
            cv2.rectangle(image, top_left, bottom_right, (0, 255, 0), 2)

            # Add label with class and confidence score
            label = f"{class_name}: {confidence:.2f}"
            cv2.putText(image, label, (top_left[0], top_left[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    @staticmethod
    def analyze_safety_gear(predictions: List[Dict], person_box: Dict, required_classes: List[str]) -> Dict[str, bool]:
        safety_gear = {cls: False for cls in required_classes}

        for detection in predictions:
            if detection['class'] in required_classes:
                gear_center_x = detection['x']
                gear_center_y = detection['y']

                if (person_box['x_min'] <= gear_center_x <= person_box['x_max'] and
                        person_box['y_min'] <= gear_center_y <= person_box['y_max']):
                    safety_gear[detection['class']] = True

        return safety_gear

    @staticmethod
    def should_log(safety_gear: Dict[str, bool]) -> bool:
        return any(not status for status in safety_gear.values())


    @staticmethod
    def display_frame(frame: cv2.Mat) -> None:
        """Display a frame using matplotlib and automatically go to the next frame."""
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)  # Convert BGR to RGB for matplotlib
        plt.imshow(frame_rgb)
        plt.axis('off')  # Hide axis for a cleaner display
        plt.draw()
        plt.pause(0.001)  # Pause to allow the GUI to update



    @staticmethod
    def detect_from_video(video_path: str, site: str, prediction_classes: str, target_fps=3) -> None:
        prediction_classes = prediction_classes.split(",")
        output_dir = "output_frames"
        os.makedirs(output_dir, exist_ok=True)
        cctv_logs_collection = mongodb_client.get_collection("cctvLogs")

        try:
            if video_path in ["1", "0", "2"]:
                video_path = int(video_path)

            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                print("Error opening video capture")
                return

            # Get video properties
            original_fps = cap.get(cv2.CAP_PROP_FPS) if cap.get(cv2.CAP_PROP_FPS) > 0 else 30
            frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            frame_interval = int(original_fps / target_fps)
            frame_number = 0

            # Calculate frame interval for 5 seconds of video
            log_interval_frames = int(5 * original_fps)
            last_log_frame = -log_interval_frames  # Start logging after the first interval

            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                if frame_number % frame_interval == 0:
                    processed_frame, results = VideoObjectDetection.process_frame(frame, prediction_classes)
                    if processed_frame is not None:
                        VideoObjectDetection.display_frame(processed_frame)
             
                if frame_number - last_log_frame >= log_interval_frames:

                        # Calculate video timestamp in seconds
                        video_timestamp = frame_number / original_fps

                        logs = []

                        if results["total_persons"] > 0:
                            for person, info in results["persons"].items():
                                if VideoObjectDetection.should_log(info["safety_gear"]):
                                    log_entry = {
                                        "person": person,
                                        "safety_gear": info["safety_gear"],
                                    }
                                    logs.append(log_entry)

                        if logs:
                            frame_log = {
                                "camera": video_path,
                                "site": site,
                                "video_timestamp_seconds": video_timestamp,
                                "frame_name": f"{site}_{video_timestamp:.2f}",
                                "required_prediction": prediction_classes,
                                "prediction": logs
                            }

                            # Insert the log into MongoDB
                            cctv_logs_collection.insert_one(frame_log)
                            print(f"Inserted log for frame at {video_timestamp:.2f} seconds into MongoDB.")

                            # Format email body with all properties from frame_log
                            email_body = (
                                f"Hello,\n\n"
                                f"Camera: {frame_log['camera']}\n"
                                f"Site: {frame_log['site']}\n"
                                f"Video Timestamp (seconds): {frame_log['video_timestamp_seconds']}\n"
                                f"Frame Name: {frame_log['frame_name']}\n"
                                f"Required Predictions: {', '.join(frame_log['required_prediction'])}\n"
                                f"Prediction Details:\n"
                            )
                            
                            # Add details of predictions to the email body
                            for log_entry in frame_log['prediction']:
                                email_body += (
                                    f"  Person: {log_entry['person']}\n"
                                    f"  Safety Gear: {log_entry['safety_gear']}\n"
                                )

                            # Function to send an email (assumed to be defined elsewhere)
                            send_email(email_body)

                            # Save the frame as an image
                            frame_filename = os.path.join(output_dir, f"{site}_{video_timestamp:.2f}.jpg")
                            cv2.imwrite(frame_filename, processed_frame)
                            print(f"Saved frame as {frame_filename}")

                            # Update the last log frame
                            last_log_frame = frame_number

                frame_number += 1

            # Release resources
            cap.release()

        except Exception as err:
            print(f"Error in detect_from_video: {err}")
