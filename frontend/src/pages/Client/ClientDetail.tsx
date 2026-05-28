import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Descriptions, Tag, Row, Col, Typography, Divider, Table, Space } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, ProjectOutlined, MessageOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { mockClientData, mockClients } from '@/mocks/clients';
import type { ClientDetail, Project } from '@/mocks/clients';
import { clientToSlug } from '@/utils/clientSlug';
import { NAVIGATION_SOURCES } from '@/constants/navigation';

const { Title, Text } = Typography;

const ClientDetail: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  const client = clientId ? mockClientData[clientId] : null;

  if (!client) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/clients')}>
          Back to Clients
        </Button>
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <Title level={3}>Client not found</Title>
          <Text>The client you're looking for doesn't exist.</Text>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'inactive':
        return 'red';
      case 'in-progress':
        return 'blue';
      default:
        return 'default';
    }
  };

  const handleMessageClient = () => {
    // Find client from mockClients to get full_name
    const fullClient = mockClients.find((c) => c.id === Number(clientId));
    if (fullClient) {
      const clientSlug = clientToSlug(fullClient.full_name);
      navigate(`/clients/${clientSlug}/messages`, { 
        state: { from: NAVIGATION_SOURCES.CLIENTS } 
      });
    } else {
      console.warn(`Client with ID ${clientId} not found`);
    }
  };

  const projectColumns: ColumnsType<Project> = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status.replace('-', ' ').toUpperCase()}</Tag>,
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => (date ? new Date(date).toLocaleDateString() : 'Ongoing'),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => `$${value.toLocaleString()}`,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/clients')}>
          Back to Clients
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={3} style={{ margin: 0 }}>
                  {client.name}
                </Title>
                <Space>
                  <Button type="primary" icon={<MessageOutlined />} onClick={handleMessageClient}>
                    Message
                  </Button>
                  <Button icon={<EditOutlined />}>Edit</Button>
                  <Button danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Space>
              </div>
            }
          >
            <Descriptions column={{ xs: 1, sm: 2 }} bordered>
              <Descriptions.Item label="Email">{client.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{client.phone}</Descriptions.Item>
              <Descriptions.Item label="Company">{client.company}</Descriptions.Item>
              <Descriptions.Item label="Position">{client.position}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(client.status)}>{client.status.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Join Date">{new Date(client.joinDate).toLocaleDateString()}</Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                {client.address.street}, {client.address.city}, {client.address.state} {client.address.zipCode},{' '}
                {client.address.country}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Summary" bordered={false}>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: '#1890ff', margin: 0 }}>
                ${client.totalRevenue.toLocaleString()}
              </Title>
              <Text type="secondary">Total Revenue</Text>
            </div>
            <Divider />
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: '#52c41a', margin: 0 }}>
                {client.projects.length}
              </Title>
              <Text type="secondary">Total Projects</Text>
            </div>
            <Divider />
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: '#722ed1', margin: 0 }}>
                {client.projects.filter((p) => p.status === 'completed').length}
              </Title>
              <Text type="secondary">Completed Projects</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ProjectOutlined style={{ marginRight: 8 }} />
            Projects
          </div>
        }
        style={{ marginTop: 16 }}
      >
        <Table columns={projectColumns} dataSource={client.projects} rowKey="id" pagination={false} size="small" />
      </Card>
    </div>
  );
};

export default ClientDetail;
