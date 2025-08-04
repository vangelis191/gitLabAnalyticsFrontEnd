import React from 'react';
import { Link } from 'react-router-dom';
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
  Container,
  SimpleGrid,
  Badge,
} from '@chakra-ui/react';
import { FiMenu, FiBarChart, FiTrendingUp, FiTarget, FiHome, FiSettings } from 'react-icons/fi';

const Home: React.FC = () => {
  const navigationItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiBarChart, label: 'Dashboard', path: '/dashboard' },
    { icon: FiTrendingUp, label: 'Velocity', path: '/velocity' },
    { icon: FiTarget, label: 'Epics', path: '/epics' },
    { icon: FiSettings, label: 'Settings', path: '/settings' },
  ];

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header with Menu Button (uses Drawer.Trigger) */}
      <Box as="header" bg="white" boxShadow="sm" px={6} py={4} position="sticky" top={0} zIndex={10}>
        <HStack justify="space-between" align="center">
          <HStack gap={4}>
            <Drawer.Root placement="start">
              <Drawer.Trigger asChild>
                <Button variant="ghost" size="lg">
                  <Icon as={FiMenu} mr={2} />
                  Menu
                </Button>
              </Drawer.Trigger>

              <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                  <Drawer.Content>
                    <Drawer.Header borderBottomWidth="1px">
                      <HStack>
                        <Icon as={FiBarChart} color="blue.500" boxSize={6} />
                        <Text fontWeight="bold">Navigation</Text>
                      </HStack>
                    </Drawer.Header>

                    <Drawer.Body>
                      <VStack gap={2} align="stretch" mt={4}>
                        {navigationItems.map((item) => (
                          <Drawer.CloseTrigger asChild key={item.path}>
                            <Link to={item.path} style={{ textDecoration: 'none' }}>
                              <Button
                                variant="ghost"
                                w="full"
                                justifyContent="flex-start"
                                _hover={{ bg: 'blue.50' }}
                                h="48px"
                              >
                                <Icon as={item.icon} mr={3} />
                                {item.label}
                              </Button>
                            </Link>
                          </Drawer.CloseTrigger>
                        ))}

                        <Box borderTop="1px" borderColor="gray.200" my={6} />

                        <VStack gap={2} align="stretch">
                          <Text fontSize="sm" color="gray.500" fontWeight="medium">
                            Project Info
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            GitLab Analytics Frontend
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            Version 1.0.0
                          </Text>
                        </VStack>
                      </VStack>
                    </Drawer.Body>

                    <Drawer.CloseTrigger asChild>
                      <CloseButton position="absolute" right={2} top={2} />
                    </Drawer.CloseTrigger>
                  </Drawer.Content>
                </Drawer.Positioner>
              </Portal>
            </Drawer.Root>

            <Heading size="lg" color="blue.600">
              GitLab Analytics
            </Heading>
          </HStack>

          <Badge colorScheme="green" variant="subtle">
            Connected
          </Badge>
        </HStack>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        <VStack gap={8} align="stretch">
          {/* Welcome Section */}
          <Box textAlign="center" py={12}>
            <Heading size="2xl" mb={4} color="gray.800">
              Welcome to GitLab Analytics Dashboard
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
              Comprehensive analytics and insights for your GitLab projects.
              Track velocity, monitor epics, and gain valuable insights into your development workflow.
            </Text>
          </Box>

          {/* Features Grid */}
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
              <HStack mb={4}>
                <Icon as={FiBarChart} color="blue.500" boxSize={6} />
                <Heading size="md">Dashboard</Heading>
              </HStack>
              <Text color="gray.600" mb={4}>
                Get an overview of your project metrics and performance indicators
              </Text>
              <Link to="/dashboard" style={{ width: '100%' }}>
                <Button colorScheme="blue" variant="outline" w="full">
                  View Dashboard
                </Button>
              </Link>
            </Box>

            <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
              <HStack mb={4}>
                <Icon as={FiTrendingUp} color="green.500" boxSize={6} />
                <Heading size="md">Velocity Tracking</Heading>
              </HStack>
              <Text color="gray.600" mb={4}>
                Monitor team velocity and sprint performance over time
              </Text>
              <Link to="/velocity" style={{ width: '100%' }}>
                <Button colorScheme="green" variant="outline" w="full">
                  View Velocity
                </Button>
              </Link>
            </Box>

            <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
              <HStack mb={4}>
                <Icon as={FiTarget} color="purple.500" boxSize={6} />
                <Heading size="md">Epic Progress</Heading>
              </HStack>
              <Text color="gray.600" mb={4}>
                Track progress of epics and major initiatives
              </Text>
              <Link to="/epics" style={{ width: '100%' }}>
                <Button colorScheme="purple" variant="outline" w="full">
                  View Epics
                </Button>
              </Link>
            </Box>
          </SimpleGrid>

          {/* Quick Actions */}
          <Box>
            <Heading size="lg" mb={6} textAlign="center">
              Quick Actions
            </Heading>
            <HStack gap={4} justify="center" wrap="wrap">
              <Link to="/dashboard">
                <Button colorScheme="blue" size="lg">
                  <Icon as={FiBarChart} mr={2} />
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/velocity">
                <Button colorScheme="green" size="lg">
                  <Icon as={FiTrendingUp} mr={2} />
                  View Velocity Chart
                </Button>
              </Link>
              <Link to="/epics">
                <Button colorScheme="purple" size="lg">
                  <Icon as={FiTarget} mr={2} />
                  Check Epic Progress
                </Button>
              </Link>
            </HStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Home;
