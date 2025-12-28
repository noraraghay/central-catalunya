import { BaseService } from './base.service';
import { COLLECTIONS } from '../config/firebase';
import { 
  Member, 
  CreateMember, 
  MemberStatus, 
  MemberRole,
  Gender,
  PaginatedResponse 
} from '../models';

export class MemberService extends BaseService<Member> {
  constructor() {
    super(COLLECTIONS.MEMBERS);
  }

  // Crear miembro con número de socio automático
  async createMember(data: CreateMember): Promise<Member> {
    const memberNumber = await this.generateMemberNumber();
    
    const memberData = {
      ...data,
      memberNumber,
    };

    return this.create(memberData as Omit<Member, 'id' | 'createdAt' | 'updatedAt'>);
  }

  // Generar número de socio
  private async generateMemberNumber(): Promise<string> {
    const sequence = await this.getNextSequence('member_number');
    const year = new Date().getFullYear();
    return `CDC-${year}-${sequence.toString().padStart(4, '0')}`;
  }

  // Buscar por DNI
  async findByDni(dni: string): Promise<Member | null> {
    const members = await this.findByField('dni', dni);
    return members.length > 0 ? members[0] : null;
  }

  // Buscar por email
  async findByEmail(email: string): Promise<Member | null> {
    const members = await this.findByField('email', email);
    return members.length > 0 ? members[0] : null;
  }

  // Buscar por número de socio
  async findByMemberNumber(memberNumber: string): Promise<Member | null> {
    const members = await this.findByField('memberNumber', memberNumber);
    return members.length > 0 ? members[0] : null;
  }

  // Obtener miembros por estado
  async getByStatus(status: MemberStatus): Promise<Member[]> {
    return this.findByField('status', status);
  }

  // Obtener miembros por rol
  async getByRole(role: MemberRole): Promise<Member[]> {
    return this.findByField('role', role);
  }

  // Obtener jugadores
  async getPlayers(): Promise<Member[]> {
    return this.findWhere([
      { field: 'role', operator: '==', value: MemberRole.PLAYER },
      { field: 'status', operator: '==', value: MemberStatus.ACTIVE }
    ]);
  }

  // Obtener entrenadores
  async getCoaches(): Promise<Member[]> {
    return this.findWhere([
      { field: 'role', operator: '==', value: MemberRole.COACH },
      { field: 'status', operator: '==', value: MemberStatus.ACTIVE }
    ]);
  }

  // Obtener miembros de un equipo
  async getTeamMembers(teamId: string): Promise<Member[]> {
    return this.findByField('teams', teamId);
  }

  // Buscar miembros por nombre
  async searchByName(searchTerm: string): Promise<Member[]> {
    // Firestore no soporta búsqueda full-text nativa
    // Esta es una implementación básica que busca por coincidencia exacta
    // Para búsqueda avanzada, considera usar Algolia o Elasticsearch
    const allMembers = await this.getAll();
    const term = searchTerm.toLowerCase();
    
    return allMembers.filter(member => 
      member.firstName.toLowerCase().includes(term) ||
      member.lastName.toLowerCase().includes(term) ||
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(term)
    );
  }

  // Añadir miembro a equipo
  async addToTeam(memberId: string, teamId: string): Promise<Member | null> {
    const member = await this.getById(memberId);
    if (!member) return null;

    const teams = member.teams || [];
    if (!teams.includes(teamId)) {
      teams.push(teamId);
      return this.update(memberId, { teams } as Partial<Member>);
    }
    return member;
  }

  // Quitar miembro de equipo
  async removeFromTeam(memberId: string, teamId: string): Promise<Member | null> {
    const member = await this.getById(memberId);
    if (!member) return null;

    const teams = (member.teams || []).filter(t => t !== teamId);
    return this.update(memberId, { teams } as Partial<Member>);
  }

  // Cambiar estado del miembro
  async changeStatus(memberId: string, status: MemberStatus): Promise<Member | null> {
    return this.update(memberId, { status } as Partial<Member>);
  }

  // Obtener estadísticas de miembros
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<MemberStatus, number>;
    byRole: Record<MemberRole, number>;
    byGender: Record<Gender, number>;
  }> {
    const members = await this.getAll();
    
    const byStatus = {} as Record<MemberStatus, number>;
    const byRole = {} as Record<MemberRole, number>;
    const byGender = {} as Record<Gender, number>;

    // Inicializar contadores
    Object.values(MemberStatus).forEach(s => byStatus[s] = 0);
    Object.values(MemberRole).forEach(r => byRole[r] = 0);
    Object.values(Gender).forEach(g => byGender[g] = 0);

    // Contar
    members.forEach(member => {
      byStatus[member.status]++;
      byRole[member.role]++;
      byGender[member.gender]++;
    });

    return {
      total: members.length,
      byStatus,
      byRole,
      byGender,
    };
  }

  // Obtener miembros con mensualidades pendientes
  async getMembersWithPendingPayments(): Promise<Member[]> {
    // Esto requeriría una subconsulta o join con pagos
    // Por simplicidad, se implementaría en el controlador combinando servicios
    return [];
  }
}

export const memberService = new MemberService();
