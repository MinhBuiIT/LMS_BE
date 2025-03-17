import { MailtrapClient } from 'mailtrap';

const TOKEN = '3a3d91dadd9e2128850a73731ad149f6';

const client = new MailtrapClient({
  token: TOKEN
});

const sender = {
  email: 'lms@demomailtrap.com',
  name: 'Learning Management Mailtrap'
};

module.exports = { client, sender };
