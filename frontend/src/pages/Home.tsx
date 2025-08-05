import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Heading,
  Icon,
  Container,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiBarChart, FiTrendingUp, FiTarget, FiUsers, FiCalendar, FiActivity, FiDownload } from 'react-icons/fi';

const Home: React.FC = () => {
  return (
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
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md" _hover={{ boxShadow: 'lg' }} transition="all 0.2s">
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

          <Box bg="white" p={6} borderRadius="lg" boxShadow="md" _hover={{ boxShadow: 'lg' }} transition="all 0.2s">
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

          <Box bg="white" p={6} borderRadius="lg" boxShadow="md" _hover={{ boxShadow: 'lg' }} transition="all 0.2s">
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

          <Box bg="white" p={6} borderRadius="lg" boxShadow="md" _hover={{ boxShadow: 'lg' }} transition="all 0.2s">
            <HStack mb={4}>
              <Icon as={FiUsers} color="teal.500" boxSize={6} />
              <Heading size="md">Team Analytics</Heading>
            </HStack>
            <Text color="gray.600" mb={4}>
              Analyze team capacity, performance, and productivity metrics
            </Text>
            <Link to="/team" style={{ width: '100%' }}>
              <Button colorScheme="teal" variant="outline" w="full">
                View Team
              </Button>
            </Link>
          </Box>

          <Box bg="white" p={6} borderRadius="lg" boxShadow="md" _hover={{ boxShadow: 'lg' }} transition="all 0.2s">
            <HStack mb={4}>
              <Icon as={FiCalendar} color="orange.500" boxSize={6} />
              <Heading size="md">Sprint Dashboard</Heading>
            </HStack>
            <Text color="gray.600" mb={4}>
              Sprint-focused analytics and performance metrics
            </Text>
            <Link to="/sprint" style={{ width: '100%' }}>
              <Button colorScheme="orange" variant="outline" w="full">
                View Sprint
              </Button>
            </Link>
          </Box>

          <Box bg="white" p={6} borderRadius="lg" boxShadow="md" _hover={{ boxShadow: 'lg' }} transition="all 0.2s">
            <HStack mb={4}>
              <Icon as={FiActivity} color="red.500" boxSize={6} />
              <Heading size="md">Health Dashboard</Heading>
            </HStack>
            <Text color="gray.600" mb={4}>
              Comprehensive health indicators and project status
            </Text>
            <Link to="/health" style={{ width: '100%' }}>
              <Button colorScheme="red" variant="outline" w="full">
                View Health
              </Button>
            </Link>
          </Box>

          <Box bg="white" p={6} borderRadius="lg" boxShadow="md" _hover={{ boxShadow: 'lg' }} transition="all 0.2s">
            <HStack mb={4}>
              <Icon as={FiDownload} color="cyan.500" boxSize={6} />
              <Heading size="md">GitLab Import</Heading>
            </HStack>
            <Text color="gray.600" mb={4}>
              Import project data from GitLab API for analysis
            </Text>
            <Link to="/import" style={{ width: '100%' }}>
              <Button colorScheme="cyan" variant="outline" w="full">
                Import Data
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
            <Link to="/team">
              <Button colorScheme="teal" size="lg">
                <Icon as={FiUsers} mr={2} />
                Team Analytics
              </Button>
            </Link>
            <Link to="/sprint">
              <Button colorScheme="orange" size="lg">
                <Icon as={FiCalendar} mr={2} />
                Sprint Dashboard
              </Button>
            </Link>
            <Link to="/health">
              <Button colorScheme="red" size="lg">
                <Icon as={FiActivity} mr={2} />
                Health Check
              </Button>
            </Link>
            <Link to="/import">
              <Button colorScheme="cyan" size="lg">
                <Icon as={FiDownload} mr={2} />
                Import Data
              </Button>
            </Link>
          </HStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default Home;
