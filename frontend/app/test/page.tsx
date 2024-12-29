'use client'

import { Table } from '~/app/ui-components/table';
import { BodyPrimaryRegular, BodySecondaryRegular } from '~/app/ui-components/typing';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const UsersList = () => {
  const columns = [
    {
      header: 'Name',
      render: (user: User) => (
        <BodyPrimaryRegular>{user.name}</BodyPrimaryRegular>
      ),
      width: '30%',
    },
    {
      header: 'Email',
      render: (user: User) => (
        <BodySecondaryRegular>{user.email}</BodySecondaryRegular>
      ),
      width: '40%',
    },
    {
      header: 'Role',
      render: (user: User) => (
        <BodySecondaryRegular>{user.role}</BodySecondaryRegular>
      ),
      width: '30%',
    },
  ];

  const data = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  ];

  return (
    <Table 
      columns={columns} 
      data={data}
      loading={false}
      emptyMessage="No users found"
    />
  );
};

export default UsersList;