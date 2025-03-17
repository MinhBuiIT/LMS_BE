const { client, sender } = require('./config');

interface ISendMailWithHtml {
  recipients: Array<{ email: string }>;
  subject: string;
  html: string;
  category: string;
}

interface ISendMailWithTemplate {
  recipients: Array<{ email: string }>;
  template_uuid: string;
  template_variables: any;
}

const sendMailWithHtml = async ({ recipients, subject, html, category }: ISendMailWithHtml) => {
  await client.send({
    from: sender,
    to: recipients,
    subject,
    html,
    category
  });
};

const sendMailWithTemplate = async ({ recipients, template_uuid, template_variables }: ISendMailWithTemplate) => {
  await client.send({
    from: sender,
    to: recipients,
    template_uuid: template_uuid,
    template_variables: template_variables
  });
};
export { sendMailWithHtml, sendMailWithTemplate };
