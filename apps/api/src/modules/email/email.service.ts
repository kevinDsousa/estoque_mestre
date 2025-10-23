import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface EmailTemplate {
  subject: string;
  html: string | ((data: any) => string);
  text?: string | ((data: any) => string);
}

export interface EmailVerificationData {
  name: string;
  email: string;
  verificationLink: string;
  companyName?: string;
}

export interface PasswordResetData {
  name: string;
  email: string;
  resetLink: string;
  companyName?: string;
}

export interface CompanyApprovalData {
  companyName: string;
  email: string;
  status: 'approved' | 'rejected';
  reason?: string;
  adminName?: string;
}

export interface NotificationEmailData {
  name: string;
  email: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  companyName?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor(private configService: ConfigService) {
    this.fromEmail = this.configService.get<string>('email.from') || 'no-reply@estoquemestre.com';
    this.frontendUrl = this.configService.get<string>('app.frontendUrl') || 'http://localhost:4200';
    
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      const emailConfig = this.configService.get('email');
      
      if (!emailConfig?.host) {
        console.warn('[EMAIL] Email configuration not found. Email service will use console logging only.');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.password,
        },
      });
      
      console.log('[EMAIL] Email transporter initialized successfully');
    } catch (error) {
      console.error('[EMAIL] Error initializing email transporter:', error.message);
      console.warn('[EMAIL] Email service is not available. Emails will be logged to console.');
    }

    // Verify connection configuration asynchronously to avoid blocking startup
    // setImmediate(() => {
    //   this.transporter.verify((error, success) => {
    //     if (error) {
    //       this.logger.error('Email transporter verification failed:', error);
    //     } else {
    //       this.logger.log('Email transporter is ready to send messages');
    //     }
    //   });
    // });
  }

  private async sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.log(`[EMAIL SIMULATION] To: ${to}, Subject: ${subject}`);
      this.logger.log(`[EMAIL SIMULATION] HTML: ${html.substring(0, 200)}...`);
      return true;
    }

    try {
      const mailOptions = {
        from: this.fromEmail,
        to,
        subject,
        html,
        text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${to}: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      return false;
    }
  }

  private loadTemplate(templateName: string): EmailTemplate {
    try {
      const templatePath = join(__dirname, 'templates', `${templateName}.hbs`);
      const templateContent = readFileSync(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateContent);
      
      return {
        subject: this.getTemplateSubject(templateName),
        html: compiledTemplate,
        text: this.getTemplateText(templateName),
      };
    } catch (error) {
      this.logger.warn(`Template ${templateName} not found, using default template`);
      return this.getDefaultTemplate(templateName);
    }
  }

  private getTemplateSubject(templateName: string): string {
    const subjects = {
      'email-verification': 'Verifique seu email - Estoque Mestre',
      'password-reset': 'Redefinir senha - Estoque Mestre',
      'company-approved': 'Empresa aprovada - Estoque Mestre',
      'company-rejected': 'Empresa rejeitada - Estoque Mestre',
      'notification': 'Nova notificação - Estoque Mestre',
    };
    return subjects[templateName] || 'Notificação - Estoque Mestre';
  }

  private getTemplateText(templateName: string): string {
    const texts = {
      'email-verification': 'Verifique seu email acessando o link fornecido.',
      'password-reset': 'Redefina sua senha acessando o link fornecido.',
      'company-approved': 'Sua empresa foi aprovada e está ativa.',
      'company-rejected': 'Sua empresa foi rejeitada. Verifique os motivos.',
      'notification': 'Você recebeu uma nova notificação.',
    };
    return texts[templateName] || 'Você recebeu uma notificação.';
  }

  private getDefaultTemplate(templateName: string): EmailTemplate {
    const templates = {
      'email-verification': {
        subject: 'Verifique seu email - Estoque Mestre',
        html: `
          <h2>Verificação de Email</h2>
          <p>Olá {{name}},</p>
          <p>Clique no link abaixo para verificar seu email:</p>
          <a href="{{verificationLink}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verificar Email</a>
          <p>Se você não criou esta conta, ignore este email.</p>
          <p>Equipe Estoque Mestre</p>
        `,
        text: 'Verifique seu email acessando: {{verificationLink}}',
      },
      'password-reset': {
        subject: 'Redefinir senha - Estoque Mestre',
        html: `
          <h2>Redefinir Senha</h2>
          <p>Olá {{name}},</p>
          <p>Clique no link abaixo para redefinir sua senha:</p>
          <a href="{{resetLink}}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Redefinir Senha</a>
          <p>Este link expira em 1 hora.</p>
          <p>Se você não solicitou esta redefinição, ignore este email.</p>
          <p>Equipe Estoque Mestre</p>
        `,
        text: 'Redefina sua senha acessando: {{resetLink}}',
      },
      'company-approved': {
        subject: 'Empresa aprovada - Estoque Mestre',
        html: `
          <h2>Empresa Aprovada</h2>
          <p>Parabéns!</p>
          <p>Sua empresa "{{companyName}}" foi aprovada e está ativa no Estoque Mestre.</p>
          <p>Você já pode acessar todas as funcionalidades da plataforma.</p>
          <a href="{{frontendUrl}}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acessar Plataforma</a>
          <p>Equipe Estoque Mestre</p>
        `,
        text: 'Sua empresa foi aprovada. Acesse: {{frontendUrl}}',
      },
      'company-rejected': {
        subject: 'Empresa rejeitada - Estoque Mestre',
        html: `
          <h2>Empresa Rejeitada</h2>
          <p>Olá,</p>
          <p>Infelizmente, sua empresa "{{companyName}}" foi rejeitada.</p>
          {{#if reason}}
          <p><strong>Motivo:</strong> {{reason}}</p>
          {{/if}}
          <p>Entre em contato conosco para mais informações.</p>
          <p>Equipe Estoque Mestre</p>
        `,
        text: 'Sua empresa foi rejeitada. Motivo: {{reason}}',
      },
      'notification': {
        subject: 'Nova notificação - Estoque Mestre',
        html: `
          <h2>{{title}}</h2>
          <p>Olá {{name}},</p>
          <p>{{message}}</p>
          {{#if actionUrl}}
          <a href="{{actionUrl}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Detalhes</a>
          {{/if}}
          <p>Equipe Estoque Mestre</p>
        `,
        text: '{{title}}: {{message}}',
      },
    };

    return templates[templateName] || templates['notification'];
  }

  async sendEmailVerification(data: EmailVerificationData): Promise<boolean> {
    const template = this.loadTemplate('email-verification');
    const html = typeof template.html === 'string' ? template.html : template.html(data);
    const text = typeof template.text === 'string' ? template.text : (template.text ? template.text(data) : undefined);

    return this.sendEmail(data.email, template.subject, html, text);
  }

  async sendPasswordReset(data: PasswordResetData): Promise<boolean> {
    const template = this.loadTemplate('password-reset');
    const html = typeof template.html === 'string' ? template.html : template.html(data);
    const text = typeof template.text === 'string' ? template.text : (template.text ? template.text(data) : undefined);

    return this.sendEmail(data.email, template.subject, html, text);
  }

  async sendCompanyApproval(data: CompanyApprovalData): Promise<boolean> {
    const template = this.loadTemplate(data.status === 'approved' ? 'company-approved' : 'company-rejected');
    const templateData = {
      ...data,
      frontendUrl: this.frontendUrl,
    };
    
    const html = typeof template.html === 'string' ? template.html : template.html(templateData);
    const text = typeof template.text === 'string' ? template.text : (template.text ? template.text(templateData) : undefined);

    return this.sendEmail(data.email, template.subject, html, text);
  }

  async sendNotificationEmail(data: NotificationEmailData): Promise<boolean> {
    const template = this.loadTemplate('notification');
    const templateData = {
      ...data,
      frontendUrl: this.frontendUrl,
    };
    
    const html = typeof template.html === 'string' ? template.html : template.html(templateData);
    const text = typeof template.text === 'string' ? template.text : (template.text ? template.text(templateData) : undefined);

    return this.sendEmail(data.email, template.subject, html, text);
  }

  async sendBulkNotificationEmails(notifications: NotificationEmailData[]): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const notification of notifications) {
      const success = await this.sendNotificationEmail(notification);
      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    this.logger.log(`Bulk email notification completed: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  async testEmailConnection(): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not configured');
      return false;
    }

    try {
      await this.transporter.verify();
      this.logger.log('Email connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Email connection test failed:', error);
      return false;
    }
  }
}
