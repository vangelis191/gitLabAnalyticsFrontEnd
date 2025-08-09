import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
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
import { FiMenu, FiBarChart, FiTrendingUp, FiTarget, FiHome, FiUsers, FiCalendar, FiActivity, FiLogOut, FiPieChart, FiGitBranch, FiCheckSquare, FiShield, FiAlertTriangle, FiRefreshCw, FiSettings, FiDownload, FiClock, FiUserPlus, FiList } from 'react-icons/fi';
import ProjectSelector from './ProjectSelector';
import { useAuth } from '../hooks/useAuth';

const Layout: React.FC = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigationItems = [
    // Main Navigation
    { icon: FiHome, label: 'Home', path: '/', category: 'main' },
    { icon: FiBarChart, label: 'Dashboard', path: '/dashboard', category: 'main' },
    
    // Analytics & Metrics
    { icon: FiTrendingUp, label: 'Velocity', path: '/velocity', category: 'analytics' },
    { icon: FiPieChart, label: 'Epic Progress', path: '/epic-chart', category: 'analytics' },
    { icon: FiClock, label: 'Lead Time', path: '/lead-time', category: 'analytics' },
    { icon: FiShield, label: 'Quality Analytics', path: '/quality', category: 'analytics' },
    { icon: FiAlertTriangle, label: 'Risk Assessment', path: '/risk-assessment', category: 'analytics' },
    { icon: FiRefreshCw, label: 'Retrospective', path: '/retrospective', category: 'analytics' },
    
    // Team & Project Management
    { icon: FiUsers, label: 'Team Dashboard', path: '/team', category: 'team' },
    { icon: FiCalendar, label: 'Sprint Dashboard', path: '/sprint', category: 'team' },
    { icon: FiActivity, label: 'Health Dashboard', path: '/health', category: 'team' },
    { icon: FiList, label: 'Issues Management', path: '/issues', category: 'team' },
    
    // Planning & Capacity
    { icon: FiCheckSquare, label: 'Sprint Planning', path: '/sprint-planning', category: 'planning' },
    { icon: FiTarget, label: 'Capacity Planning', path: '/capacity-planning', category: 'planning' },
    
    // Developer Management
    { icon: FiUserPlus, label: 'Developers', path: '/developers', category: 'developers' },
    
    // Configuration
    { icon: FiSettings, label: 'Provider Config', path: '/provider-config', category: 'config' },
    { icon: FiDownload, label: 'Import Developers', path: '/import-developers', category: 'config' },
    { icon: FiGitBranch, label: 'GitLab Integration', path: '/gitlab-integration', category: 'config' },
  ];

  const groupedItems = {
    main: navigationItems.filter(item => item.category === 'main'),
    analytics: navigationItems.filter(item => item.category === 'analytics'),
    team: navigationItems.filter(item => item.category === 'team'),
    planning: navigationItems.filter(item => item.category === 'planning'),
    developers: navigationItems.filter(item => item.category === 'developers'),
    config: navigationItems.filter(item => item.category === 'config'),
  };

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

          <HStack gap={6} align="center">
            <ProjectSelector />
            
            {user && (
              <HStack gap={2}>
                <Box 
                  w="32px" 
                  h="32px" 
                  borderRadius="full" 
                  bg="blue.500" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  color="white"
                  fontSize="sm"
                  fontWeight="bold"
                >
                  {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress?.[0] || 'U'}
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontSize="sm" fontWeight="medium">
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {user.emailAddresses[0]?.emailAddress || 'No email'}
                  </Text>
                </VStack>
              </HStack>
            )}
            
            <Badge colorScheme="green" variant="subtle">
              Connected
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await signOut();
                } catch (error) {
                  console.error('Error during sign out:', error);
                }
              }}
            >
              <Icon as={FiLogOut} mr={2} />
              Logout
            </Button>
          </HStack>
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
                  {/* Main Navigation */}
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} mt={2}>
                    MAIN
                  </Text>
                  {groupedItems.main.map((item) => (
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
                        h="44px"
                        color="gray.700"
                        _active={{ bg: 'blue.100' }}
                      >
                        <Icon as={item.icon} mr={3} color="blue.500" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}

                  {/* Analytics */}
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} mt={4}>
                    ANALYTICS & METRICS
                  </Text>
                  {groupedItems.analytics.map((item) => (
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
                        h="44px"
                        color="gray.700"
                        _active={{ bg: 'blue.100' }}
                      >
                        <Icon as={item.icon} mr={3} color="blue.500" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}

                  {/* Team Management */}
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} mt={4}>
                    TEAM & PROJECT
                  </Text>
                  {groupedItems.team.map((item) => (
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
                        h="44px"
                        color="gray.700"
                        _active={{ bg: 'blue.100' }}
                      >
                        <Icon as={item.icon} mr={3} color="blue.500" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}

                  {/* Planning */}
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} mt={4}>
                    PLANNING & CAPACITY
                  </Text>
                  {groupedItems.planning.map((item) => (
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
                        h="44px"
                        color="gray.700"
                        _active={{ bg: 'blue.100' }}
                      >
                        <Icon as={item.icon} mr={3} color="blue.500" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}

                  {/* Developers */}
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} mt={4}>
                    DEVELOPER MANAGEMENT
                  </Text>
                  {groupedItems.developers.map((item) => (
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
                        h="44px"
                        color="gray.700"
                        _active={{ bg: 'blue.100' }}
                      >
                        <Icon as={item.icon} mr={3} color="blue.500" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}

                  {/* Configuration */}
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} mt={4}>
                    CONFIGURATION
                  </Text>
                  {groupedItems.config.map((item) => (
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
                        h="44px"
                        color="gray.700"
                        _active={{ bg: 'blue.100' }}
                      >
                        <Icon as={item.icon} mr={3} color="blue.500" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}

                  <Box borderTop="1px" borderColor="gray.200" my={6} />

                  {user && (
                    <VStack gap={3} align="stretch" p={4} bg="gray.50" borderRadius="md" mb={4}>
                      <HStack gap={3}>
                        <Box 
                          w="32px" 
                          h="32px" 
                          borderRadius="full" 
                          bg="blue.500" 
                          display="flex" 
                          alignItems="center" 
                          justifyContent="center"
                          color="white"
                          fontSize="sm"
                          fontWeight="bold"
                        >
                          {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress?.[0] || 'U'}
                        </Box>
                        <VStack align="start" gap={0}>
                          <Text fontSize="sm" fontWeight="semibold">
                            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {user.emailAddresses[0]?.emailAddress || 'No email'}
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  )}

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