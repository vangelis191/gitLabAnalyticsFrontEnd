import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
  Box,
  Button,
  CloseButton,
  Drawer,
  HStack,
  Portal,
  VStack,
  Text,
  Heading,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { FiMenu, FiBarChart, FiTrendingUp, FiTarget, FiHome, FiUsers, FiCalendar, FiActivity, FiDownload } from 'react-icons/fi';

const Layout: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigationItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiBarChart, label: 'Dashboard', path: '/dashboard' },
    { icon: FiTrendingUp, label: 'Velocity', path: '/velocity' },
    { icon: FiTarget, label: 'Epics', path: '/epics' },
    { icon: FiUsers, label: 'Team', path: '/team' },
    { icon: FiCalendar, label: 'Sprint', path: '/sprint' },
    { icon: FiActivity, label: 'Health', path: '/health' },
    { icon: FiDownload, label: 'Import', path: '/import' },
  ];

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header with Menu Button */}
      <Box as="header" bg="white" boxShadow="sm" px={6} py={4} position="sticky" top={0} zIndex={10}>
        <HStack justify="space-between" align="center">
          <HStack gap={4}>
            <Button 
              variant="ghost" 
              size="lg"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Icon as={FiMenu} mr={2} />
              Menu
            </Button>

            <Heading size="lg" color="blue.600">
              GitLab Analytics
            </Heading>
          </HStack>

          <Badge colorScheme="green" variant="subtle">
            Connected
          </Badge>
        </HStack>
      </Box>

      {/* Drawer */}
      <Drawer.Root open={isDrawerOpen} onOpenChange={({ open }) => setIsDrawerOpen(open)} placement="start">
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header borderBottomWidth="1px" bg="blue.50">
                <HStack gap={3}>
                  <Icon as={FiBarChart} color="blue.600" boxSize={6} />
                  <VStack align="start" gap={0}>
                    <Text fontWeight="bold" fontSize="lg" color="blue.800">Navigation</Text>
                    <Text fontSize="sm" color="blue.600">GitLab Analytics</Text>
                  </VStack>
                </HStack>
                <CloseButton 
                  position="absolute" 
                  right={3} 
                  top={3}
                  onClick={() => setIsDrawerOpen(false)}
                />
              </Drawer.Header>

              <Drawer.Body bg="white">
                <VStack gap={1} align="stretch" mt={4}>
                  {navigationItems.map((item) => (
                    <Link 
                      to={item.path} 
                      key={item.path} 
                      style={{ textDecoration: 'none' }}
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        w="full"
                        justifyContent="flex-start"
                        _hover={{ bg: 'blue.50' }}
                        h="48px"
                        color="gray.700"
                        _active={{ bg: 'blue.100' }}
                      >
                        <Icon as={item.icon} mr={3} color="blue.500" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}

                  <Box borderTop="1px" borderColor="gray.200" my={6} />

                  <VStack gap={3} align="stretch" p={4} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                      Project Info
                    </Text>
                    <Text fontSize="sm" color="gray.700" fontWeight="medium">
                      GitLab Analytics Frontend
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Version 1.0.0
                    </Text>
                  </VStack>
                </VStack>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>

      {/* Main Content */}
      <Box as="main">
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 