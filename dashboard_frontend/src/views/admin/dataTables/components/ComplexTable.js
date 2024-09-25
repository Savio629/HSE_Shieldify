import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Card from 'components/card/Card';
import Menu from 'components/menu/MainMenu';
import { MdCheckCircle, MdCancel } from 'react-icons/md';

// Column Helper
const columnHelper = createColumnHelper();

// React Component
export default function ComplexTable() {
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLogDetails, setSelectedLogDetails] = useState(null);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Fetch data from API
  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch('http://127.0.0.1:8000/dash/kiosk-logs'); // Use your actual server URL
        const result = await response.json();
        if (result.status === 200) {
          setData(result.data);
        } else {
          console.error('Failed to fetch logs:', result.message);
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    }

    fetchLogs();
  }, []);

  // Function to check if all fields in logs are true
  const checkApprovalStatus = (log) => {
    return Object.values(log).every((value) => value === true)
      ? 'Approved'
      : 'Error';
  };

  // Open modal when log details are clicked
  const openLogModal = (logDetails) => {
    setSelectedLogDetails(logDetails);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLogDetails(null);
  };

  // Define columns
  const columns = [
    columnHelper.accessor('empID', {
      id: 'empID',
      header: () => (
        <Text
          justifyContent="center"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Employee ID
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} textAlign="center" fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('log', {
      id: 'log',
      header: () => (
        <Text
          justifyContent="center"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Log Details
        </Text>
      ),
      cell: (info) => (
        <Box onClick={() => openLogModal(info.getValue())} cursor="pointer">
          {Object.entries(info.getValue()).map(([key, value]) => (
            <Text key={key} color={textColor} textAlign="center" fontSize="sm" fontWeight="700">
              {`${key}: ${value ? 'Yes' : 'No'}`}
            </Text>
          ))}
        </Box>
      ),
    }),
    {
      accessorFn: (row) => checkApprovalStatus(row.log),
      id: 'status',
      header: () => (
        <Text
          justifyContent="center"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Status
        </Text>
      ),
      cell: (info) => (
        <Icon
          as={info.getValue() === 'Approved' ? MdCheckCircle : MdCancel}
          color={info.getValue() === 'Approved' ? 'green.500' : 'red.500'}
          mr={2}
        />
      ),
    },
    {
      accessorFn: (row) => checkApprovalStatus(row.timestamp),
      id: 'Timestamp',
      header: () => (
        <Text
          justifyContent="center"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Timestamp
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} textAlign="center" fontSize="sm" fontWeight="700">
          abc
        </Text>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  return (
    <Card flexDirection="column" w="100%" px="0px" overflowX="auto">
      <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
        <Text color={textColor} fontSize="22px" fontWeight="700" lineHeight="100%">
          Kiosk Log
        </Text>
        <Menu />
      </Flex>
      <Box overflowX="auto">
        <Table variant="simple" color="gray.500" mb="24px" mt="12px">
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th
                    key={header.id}
                    colSpan={header.colSpan}
                    pe="10px"
                    borderColor={borderColor}
                    cursor="pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <Flex
                      justifyContent="center"
                      align="center"
                      fontSize={{ sm: '10px', lg: '12px' }}
                      color="gray.400"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted()] ?? null}
                    </Flex>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => (
              <Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Td
                    key={cell.id}
                    fontSize={{ sm: '14px' }}
                    minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                    borderColor="transparent"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Modal for Log Details */}
      {selectedLogDetails && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Log Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {Object.entries(selectedLogDetails).map(([key, value]) => (
                <Text key={key}>{`${key}: ${value ? 'Yes' : 'No'}`}</Text>
              ))}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={closeModal}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Card>
  );
}
