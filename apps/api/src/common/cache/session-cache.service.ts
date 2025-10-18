import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

export interface UserSession {
  userId: string;
  companyId: string;
  deviceId: string;
  lastActivity: Date;
  permissions: string[];
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class SessionCacheService {
  private readonly sessionTtl: number;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.sessionTtl = (this.configService.get<number>('redis.cache.sessions') || 3600) * 1000; // Convert to milliseconds
  }

  /**
   * Cria uma nova sessão para o usuário
   */
  async createSession(
    userId: string,
    companyId: string,
    deviceId: string,
    permissions: string[],
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    const sessionId = uuidv4();
    const session: UserSession = {
      userId,
      companyId,
      deviceId,
      lastActivity: new Date(),
      permissions,
      ipAddress,
      userAgent,
    };

    // Armazenar sessão
    await this.cacheManager.set(`session:${sessionId}`, session, this.sessionTtl);
    
    // Armazenar referência por usuário
    await this.cacheManager.set(
      `user:${userId}:session:${sessionId}`,
      { sessionId, deviceId, lastActivity: new Date() },
      this.sessionTtl,
    );

    // Adicionar à lista de sessões ativas do usuário
    const userSessions = await this.getUserActiveSessions(userId);
    userSessions.push({ sessionId, deviceId, lastActivity: new Date() });
    await this.cacheManager.set(`user:${userId}:sessions`, userSessions, this.sessionTtl);

    return sessionId;
  }

  /**
   * Obtém uma sessão pelo ID
   */
  async getSession(sessionId: string): Promise<UserSession | null> {
    return (await this.cacheManager.get<UserSession>(`session:${sessionId}`)) || null;
  }

  /**
   * Atualiza a última atividade da sessão
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.lastActivity = new Date();
      await this.cacheManager.set(`session:${sessionId}`, session, this.sessionTtl);
      
      // Atualizar referência do usuário
      await this.cacheManager.set(
        `user:${session.userId}:session:${sessionId}`,
        { sessionId, deviceId: session.deviceId, lastActivity: new Date() },
        this.sessionTtl,
      );
    }
  }

  /**
   * Remove uma sessão específica
   */
  async removeSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      // Remover sessão principal
      await this.cacheManager.del(`session:${sessionId}`);
      
      // Remover referência do usuário
      await this.cacheManager.del(`user:${session.userId}:session:${sessionId}`);
      
      // Atualizar lista de sessões ativas
      const userSessions = await this.getUserActiveSessions(session.userId);
      const updatedSessions = userSessions.filter(s => s.sessionId !== sessionId);
      await this.cacheManager.set(`user:${session.userId}:sessions`, updatedSessions, this.sessionTtl);
    }
  }

  /**
   * Remove todas as sessões de um usuário
   */
  async removeAllUserSessions(userId: string): Promise<void> {
    const userSessions = await this.getUserActiveSessions(userId);
    
    for (const userSession of userSessions) {
      await this.cacheManager.del(`session:${userSession.sessionId}`);
      await this.cacheManager.del(`user:${userId}:session:${userSession.sessionId}`);
    }
    
    await this.cacheManager.del(`user:${userId}:sessions`);
  }

  /**
   * Remove todas as sessões de uma empresa
   */
  async removeAllCompanySessions(companyId: string): Promise<void> {
    // Esta implementação seria mais complexa em produção
    // Por simplicidade, vamos usar um padrão de chave
    const keys = await this.getAllSessionKeys();
    
    for (const key of keys) {
      const session = await this.cacheManager.get<UserSession>(key);
      if (session && session.companyId === companyId) {
        await this.removeSession(key.replace('session:', ''));
      }
    }
  }

  /**
   * Obtém todas as sessões ativas de um usuário
   */
  async getUserActiveSessions(userId: string): Promise<Array<{ sessionId: string; deviceId: string; lastActivity: Date }>> {
    const sessions = await this.cacheManager.get<Array<{ sessionId: string; deviceId: string; lastActivity: Date }>>(`user:${userId}:sessions`);
    return sessions || [];
  }

  /**
   * Verifica se uma sessão é válida
   */
  async isSessionValid(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    return session !== null;
  }

  /**
   * Obtém todas as chaves de sessão (método auxiliar)
   */
  private async getAllSessionKeys(): Promise<string[]> {
    // Em uma implementação real, você usaria SCAN do Redis
    // Por simplicidade, retornamos um array vazio
    return [];
  }

  /**
   * Limpa sessões expiradas
   */
  async cleanExpiredSessions(): Promise<void> {
    // Em uma implementação real, você usaria TTL do Redis
    // Por simplicidade, não implementamos aqui
  }

  /**
   * Obtém estatísticas de sessões
   */
  async getSessionStats(): Promise<{
    totalActiveSessions: number;
    sessionsByCompany: Record<string, number>;
  }> {
    // Implementação simplificada
    return {
      totalActiveSessions: 0,
      sessionsByCompany: {},
    };
  }
}
