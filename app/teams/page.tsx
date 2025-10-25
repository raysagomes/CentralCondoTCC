'use client'

import React, { useState } from 'react'
import {
    Card,
    Row,
    Col,
    Button,
    Table,
    Avatar,
    Tag,
    Space,
    Modal,
    Form,
    Input,
    Select,
    Upload,
    message,
    Tooltip,
    Popconfirm,
    Typography,
    Tabs,
    List,
    Badge,
    Divider
} from 'antd'
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    TeamOutlined,
    SettingOutlined,
    UploadOutlined,
    SearchOutlined,
    FilterOutlined,
    ExportOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined
} from '@ant-design/icons'
import MainLayout from '@/components/layout/MainLayout'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
const { Option } = Select
const { TabPane } = Tabs
interface TeamMember {
    id: string
    name: string
    email: string
    role: string
    teamRole: string
    avatar?: string
    joinedAt: string
    status: 'active' | 'inactive'
    phone?: string
    skills: string[]
    projectsCount: number
    tasksCompleted: number
}

interface Team {
    id: string
    name: string
    description: string
    avatar?: string
    color: string
    membersCount: number
    projectsCount: number
    createdAt: string
    leader: string
    status: 'active' | 'inactive'
}

const TeamsPage = () => {
    const [teams, setTeams] = useState<Team[]>([
        {
            id: '1',
            name: 'Desenvolvimento Frontend',
            description: 'Equipe responsável pelo desenvolvimento das interfaces de usuário',
            color: '#1890ff',
            membersCount: 8,
            projectsCount: 5,
            createdAt: '2024-01-15',
            leader: 'Maria Silva',
            status: 'active'
        },
        {
            id: '2',
            name: 'Backend & APIs',
            description: 'Desenvolvimento de APIs e sistemas backend',
            color: '#52c41a',
            membersCount: 6,
            projectsCount: 3,
            createdAt: '2024-02-20',
            leader: 'João Santos',
            status: 'active'
        },
        {
            id: '3',
            name: 'Design & UX',
            description: 'Design de interfaces e experiência do usuário',
            color: '#722ed1',
            membersCount: 4,
            projectsCount: 7,
            createdAt: '2024-03-10',
            leader: 'Ana Costa',
            status: 'active'
        }
    ])

    const [members, setMembers] = useState<TeamMember[]>([
        {
            id: '1',
            name: 'Maria Silva',
            email: 'maria@empresa.com',
            role: 'Desenvolvedor Senior',
            teamRole: 'leader',
            joinedAt: '2024-01-15',
            status: 'active',
            phone: '(11) 99999-9999',
            skills: ['React', 'TypeScript', 'Node.js'],
            projectsCount: 3,
            tasksCompleted: 45
        },
        {
            id: '2',
            name: 'João Santos',
            email: 'joao@empresa.com',
            role: 'Desenvolvedor Backend',
            teamRole: 'member',
            joinedAt: '2024-02-01',
            status: 'active',
            phone: '(11) 88888-8888',
            skills: ['Python', 'Django', 'PostgreSQL'],
            projectsCount: 2,
            tasksCompleted: 32
        },
        {
            id: '3',
            name: 'Ana Costa',
            email: 'ana@empresa.com',
            role: 'Designer UX/UI',
            teamRole: 'member',
            joinedAt: '2024-01-20',
            status: 'active',
            phone: '(11) 77777-7777',
            skills: ['Figma', 'Adobe XD', 'Photoshop'],
            projectsCount: 4,
            tasksCompleted: 28
        }
    ])

    const [isTeamModalVisible, setIsTeamModalVisible] = useState(false)
    const [isMemberModalVisible, setIsMemberModalVisible] = useState(false)
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
    const [activeTab, setActiveTab] = useState('teams')
    const [form] = Form.useForm()

    const teamColumns: ColumnsType<Team> = [
        {
            title: 'Equipe',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="flex items-center">
                    <Avatar
                        size={40}
                        style={{ backgroundColor: record.color }}
                        icon={<TeamOutlined />}
                    />
                    <div className="ml-3">
                        <div className="font-medium">{text}</div>
                        <div className="text-gray-500 text-sm">{record.description}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Líder',
            dataIndex: 'leader',
            key: 'leader',
            render: (text) => (
                <div className="flex items-center">
                    <Avatar size={24} icon={<UserOutlined />} />
                    <span className="ml-2">{text}</span>
                </div>
            ),
        },
        {
            title: 'Membros',
            dataIndex: 'membersCount',
            key: 'membersCount',
            render: (count) => (
                <Badge count={count} color="#1890ff" />
            ),
        },
        {
            title: 'Projetos',
            dataIndex: 'projectsCount',
            key: 'projectsCount',
            render: (count) => (
                <Badge count={count} color="#52c41a" />
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status === 'active' ? 'Ativa' : 'Inativa'}
                </Tag>
            ),
        },
        {
            title: 'Criada em',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('pt-BR'),
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Editar">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditTeam(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Configurações">
                        <Button
                            type="text"
                            icon={<SettingOutlined />}
                        />
                    </Tooltip>
                    <Tooltip title="Excluir">
                        <Popconfirm
                            title="Tem certeza que deseja excluir esta equipe?"
                            onConfirm={() => handleDeleteTeam(record.id)}
                            okText="Sim"
                            cancelText="Não"
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ]

    const memberColumns: ColumnsType<TeamMember> = [
        {
            title: 'Membro',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="flex items-center">
                    <Avatar
                        size={40}
                        src={record.avatar}
                        icon={<UserOutlined />}
                    />
                    <div className="ml-3">
                        <div className="font-medium">{text}</div>
                        <div className="text-gray-500 text-sm">{record.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Cargo',
            dataIndex: 'role',
            key: 'role',
        },
        {
            title: 'Função na Equipe',
            dataIndex: 'teamRole',
            key: 'teamRole',
            render: (role) => (
                <Tag color={role === 'leader' ? 'gold' : 'blue'}>
                    {role === 'leader' ? 'Líder' : 'Membro'}
                </Tag>
            ),
        },
        {
            title: 'Skills',
            dataIndex: 'skills',
            key: 'skills',
            render: (skills) => (
                <div>
                    {skills.slice(0, 2).map((skill: string) => (
                        <Tag key={skill} color="purple" className="mb-1">
                            {skill}
                        </Tag>
                    ))}
                    {skills.length > 2 && (
                        <Tag color="default">+{skills.length - 2}</Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Projetos',
            dataIndex: 'projectsCount',
            key: 'projectsCount',
            render: (count) => <Badge count={count} color="#1890ff" />,
        },
        {
            title: 'Tarefas Concluídas',
            dataIndex: 'tasksCompleted',
            key: 'tasksCompleted',
            render: (count) => <Badge count={count} color="#52c41a" />,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status === 'active' ? 'Ativo' : 'Inativo'}
                </Tag>
            ),
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Editar">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditMember(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Enviar Email">
                        <Button
                            type="text"
                            icon={<MailOutlined />}
                        />
                    </Tooltip>
                    <Tooltip title="Excluir">
                        <Popconfirm
                            title="Tem certeza que deseja remover este membro?"
                            onConfirm={() => handleDeleteMember(record.id)}
                            okText="Sim"
                            cancelText="Não"
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ]

    const handleCreateTeam = () => {
        setSelectedTeam(null)
        form.resetFields()
        setIsTeamModalVisible(true)
    }

    const handleEditTeam = (team: Team) => {
        setSelectedTeam(team)
        form.setFieldsValue(team)
        setIsTeamModalVisible(true)
    }

    const handleDeleteTeam = (id: string) => {
        setTeams(teams.filter(team => team.id !== id))
        message.success('Equipe excluída com sucesso!')
    }

    const handleCreateMember = () => {
        setSelectedMember(null)
        form.resetFields()
        setIsMemberModalVisible(true)
    }

    const handleEditMember = (member: TeamMember) => {
        setSelectedMember(member)
        form.setFieldsValue(member)
        setIsMemberModalVisible(true)
    }

    const handleDeleteMember = (id: string) => {
        setMembers(members.filter(member => member.id !== id))
        message.success('Membro removido com sucesso!')
    }

    const handleTeamSubmit = (values: any) => {
        if (selectedTeam) {
            setTeams(teams.map(team =>
                team.id === selectedTeam.id ? { ...team, ...values } : team
            ))
            message.success('Equipe atualizada com sucesso!')
        } else {
            const newTeam: Team = {
                id: Date.now().toString(),
                ...values,
                membersCount: 0,
                projectsCount: 0,
                createdAt: new Date().toISOString(),
                status: 'active'
            }
            setTeams([...teams, newTeam])
            message.success('Equipe criada com sucesso!')
        }
        setIsTeamModalVisible(false)
        form.resetFields()
    }

    const handleMemberSubmit = (values: any) => {
        if (selectedMember) {
            setMembers(members.map(member =>
                member.id === selectedMember.id ? { ...member, ...values } : member
            ))
            message.success('Membro atualizado com sucesso!')
        } else {
            const newMember: TeamMember = {
                id: Date.now().toString(),
                ...values,
                joinedAt: new Date().toISOString(),
                status: 'active',
                projectsCount: 0,
                tasksCompleted: 0
            }
            setMembers([...members, newMember])
            message.success('Membro adicionado com sucesso!')
        }
        setIsMemberModalVisible(false)
        form.resetFields()
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Title level={2} className="!mb-2">
                            Gerenciamento de Equipes
                        </Title>
                        <Text type="secondary">
                            Crie e gerencie equipes, atribua funções e controle acessos
                        </Text>
                    </div>
                </div>

                {/* Estatísticas */}
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={8}>
                        <Card className="text-center">
                            <div className="text-3xl font-bold text-blue-500 mb-2">
                                {teams.length}
                            </div>
                            <div className="text-gray-600">Total de Equipes</div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card className="text-center">
                            <div className="text-3xl font-bold text-green-500 mb-2">
                                {members.length}
                            </div>
                            <div className="text-gray-600">Total de Membros</div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card className="text-center">
                            <div className="text-3xl font-bold text-purple-500 mb-2">
                                {teams.filter(t => t.status === 'active').length}
                            </div>
                            <div className="text-gray-600">Equipes Ativas</div>
                        </Card>
                    </Col>
                </Row>

                {/* Tabs */}
                <Card>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        tabBarExtraContent={
                            <Space>
                                <Button icon={<SearchOutlined />}>Pesquisar</Button>
                                <Button icon={<FilterOutlined />}>Filtrar</Button>
                                <Button icon={<ExportOutlined />}>Exportar</Button>
                                {activeTab === 'teams' ? (
                                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTeam}>
                                        Nova Equipe
                                    </Button>
                                ) : (
                                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateMember}>
                                        Novo Membro
                                    </Button>
                                )}
                            </Space>
                        }
                    >
                        <TabPane tab="Equipes" key="teams">
                            <Table
                                columns={teamColumns}
                                dataSource={teams}
                                rowKey="id"
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total) => `Total: ${total} equipes`
                                }}
                                scroll={{ x: 1000 }}
                            />
                        </TabPane>

                        <TabPane tab="Membros" key="members">
                            <Table
                                columns={memberColumns}
                                dataSource={members}
                                rowKey="id"
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total) => `Total: ${total} membros`
                                }}
                                scroll={{ x: 1200 }}
                            />
                        </TabPane>

                        <TabPane tab="Organograma" key="org">
                            <div className="p-8 text-center">
                                <TeamOutlined className="text-6xl text-gray-300 mb-4" />
                                <Title level={4} type="secondary">Organograma</Title>
                                <Text type="secondary">
                                    Visualização hierárquica das equipes e membros
                                </Text>
                                <div className="mt-4">
                                    <Button type="primary" size="large">
                                        Visualizar Organograma
                                    </Button>
                                </div>
                            </div>
                        </TabPane>
                    </Tabs>
                </Card>

                {/* Modal para Criar/Editar Equipe */}
                <Modal
                    title={selectedTeam ? 'Editar Equipe' : 'Nova Equipe'}
                    open={isTeamModalVisible}
                    onCancel={() => setIsTeamModalVisible(false)}
                    footer={null}
                    width={600}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleTeamSubmit}
                    >
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    label="Nome da Equipe"
                                    name="name"
                                    rules={[{ required: true, message: 'Nome é obrigatório' }]}
                                >
                                    <Input placeholder="Ex: Desenvolvimento Frontend" />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item
                                    label="Descrição"
                                    name="description"
                                >
                                    <Input.TextArea
                                        rows={3}
                                        placeholder="Descreva as responsabilidades da equipe"
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Líder da Equipe"
                                    name="leader"
                                    rules={[{ required: true, message: 'Líder é obrigatório' }]}
                                >
                                    <Select placeholder="Selecionar líder">
                                        {members.map(member => (
                                            <Option key={member.id} value={member.name}>
                                                {member.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Cor da Equipe"
                                    name="color"
                                    rules={[{ required: true, message: 'Cor é obrigatória' }]}
                                >
                                    <Select placeholder="Selecionar cor">
                                        <Option value="#1890ff">Azul</Option>
                                        <Option value="#52c41a">Verde</Option>
                                        <Option value="#722ed1">Roxo</Option>
                                        <Option value="#fa8c16">Laranja</Option>
                                        <Option value="#f5222d">Vermelho</Option>
                                        <Option value="#13c2c2">Ciano</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label="Avatar da Equipe">
                                    <Upload
                                        listType="picture-card"
                                        maxCount={1}
                                        beforeUpload={() => false}
                                    >
                                        <div>
                                            <UploadOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    </Upload>
                                </Form.Item>
                            </Col>
                        </Row>

                        <div className="flex justify-end space-x-2 mt-6">
                            <Button onClick={() => setIsTeamModalVisible(false)}>
                                Cancelar
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {selectedTeam ? 'Atualizar' : 'Criar'} Equipe
                            </Button>
                        </div>
                    </Form>
                </Modal>

                {/* Modal para Criar/Editar Membro */}
                <Modal
                    title={selectedMember ? 'Editar Membro' : 'Novo Membro'}
                    open={isMemberModalVisible}
                    onCancel={() => setIsMemberModalVisible(false)}
                    footer={null}
                    width={700}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleMemberSubmit}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Nome Completo"
                                    name="name"
                                    rules={[{ required: true, message: 'Nome é obrigatório' }]}
                                >
                                    <Input placeholder="Ex: João Silva" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[
                                        { required: true, message: 'Email é obrigatório' },
                                        { type: 'email', message: 'Email inválido' }
                                    ]}
                                >
                                    <Input placeholder="joao@empresa.com" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Cargo"
                                    name="role"
                                    rules={[{ required: true, message: 'Cargo é obrigatório' }]}
                                >
                                    <Input placeholder="Ex: Desenvolvedor Senior" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Função na Equipe"
                                    name="teamRole"
                                    rules={[{ required: true, message: 'Função é obrigatória' }]}
                                >
                                    <Select placeholder="Selecionar função">
                                        <Option value="leader">Líder</Option>
                                        <Option value="member">Membro</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Telefone"
                                    name="phone"
                                >
                                    <Input placeholder="(11) 99999-9999" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Skills"
                                    name="skills"
                                >
                                    <Select
                                        mode="tags"
                                        placeholder="Adicionar skills"
                                        tokenSeparators={[',']}
                                    >
                                        <Option value="React">React</Option>
                                        <Option value="Node.js">Node.js</Option>
                                        <Option value="Python">Python</Option>
                                        <Option value="TypeScript">TypeScript</Option>
                                        <Option value="PostgreSQL">PostgreSQL</Option>
                                        <Option value="Figma">Figma</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label="Avatar">
                                    <Upload
                                        listType="picture-card"
                                        maxCount={1}
                                        beforeUpload={() => false}
                                    >
                                        <div>
                                            <UploadOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    </Upload>
                                </Form.Item>
                            </Col>
                        </Row>

                        <div className="flex justify-end space-x-2 mt-6">
                            <Button onClick={() => setIsMemberModalVisible(false)}>
                                Cancelar
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {selectedMember ? 'Atualizar' : 'Adicionar'} Membro
                            </Button>
                        </div>
                    </Form>
                </Modal>
            </div>
        </MainLayout>
    )
}

export default TeamsPage