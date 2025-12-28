import { BaseService } from './base.service';
import { COLLECTIONS } from '../config/firebase';
import { Team, CreateTeam, Gender, Category, TeamStats } from '../models';

export class TeamService extends BaseService<Team> {
  constructor() {
    super(COLLECTIONS.TEAMS);
  }

  // Crear equipo
  async createTeam(data: CreateTeam): Promise<Team> {
    const teamData = {
      ...data,
      playerIds: data.playerIds || [],
      isActive: data.isActive ?? true,
      stats: data.stats || {
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      },
    };

    return this.create(teamData as Omit<Team, 'id' | 'createdAt' | 'updatedAt'>);
  }

  // Obtener equipos por género
  async getByGender(gender: Gender): Promise<Team[]> {
    return this.findByField('gender', gender);
  }

  // Obtener equipos femeninos
  async getFemaleTeams(): Promise<Team[]> {
    return this.getByGender(Gender.FEMALE);
  }

  // Obtener equipos masculinos
  async getMaleTeams(): Promise<Team[]> {
    return this.getByGender(Gender.MALE);
  }

  // Obtener equipos por categoría
  async getByCategory(category: Category): Promise<Team[]> {
    return this.findByField('category', category);
  }

  // Obtener equipos por temporada
  async getBySeason(season: string): Promise<Team[]> {
    return this.findByField('season', season);
  }

  // Obtener equipos activos
  async getActiveTeams(): Promise<Team[]> {
    return this.findByField('isActive', true);
  }

  // Obtener equipos de un entrenador
  async getByCoach(coachId: string): Promise<Team[]> {
    return this.findByField('coachId', coachId);
  }

  // Añadir jugador a equipo
  async addPlayer(teamId: string, playerId: string): Promise<Team | null> {
    const team = await this.getById(teamId);
    if (!team) return null;

    const playerIds = team.playerIds || [];
    if (!playerIds.includes(playerId)) {
      playerIds.push(playerId);
      return this.update(teamId, { playerIds } as Partial<Team>);
    }
    return team;
  }

  // Quitar jugador de equipo
  async removePlayer(teamId: string, playerId: string): Promise<Team | null> {
    const team = await this.getById(teamId);
    if (!team) return null;

    const playerIds = (team.playerIds || []).filter(id => id !== playerId);
    return this.update(teamId, { playerIds } as Partial<Team>);
  }

  // Asignar entrenador
  async assignCoach(teamId: string, coachId: string): Promise<Team | null> {
    return this.update(teamId, { coachId } as Partial<Team>);
  }

  // Añadir asistente
  async addAssistantCoach(teamId: string, assistantId: string): Promise<Team | null> {
    const team = await this.getById(teamId);
    if (!team) return null;

    const assistantCoachIds = team.assistantCoachIds || [];
    if (!assistantCoachIds.includes(assistantId)) {
      assistantCoachIds.push(assistantId);
      return this.update(teamId, { assistantCoachIds } as Partial<Team>);
    }
    return team;
  }

  // Actualizar estadísticas
  async updateStats(teamId: string, stats: Partial<TeamStats>): Promise<Team | null> {
    const team = await this.getById(teamId);
    if (!team) return null;

    const updatedStats = {
      ...team.stats,
      ...stats,
    };

    return this.update(teamId, { stats: updatedStats } as Partial<Team>);
  }

  // Registrar resultado de partido
  async recordMatchResult(
    teamId: string, 
    goalsFor: number, 
    goalsAgainst: number
  ): Promise<Team | null> {
    const team = await this.getById(teamId);
    if (!team) return null;

    const stats = team.stats || {
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    };

    stats.matchesPlayed++;
    stats.goalsFor += goalsFor;
    stats.goalsAgainst += goalsAgainst;

    if (goalsFor > goalsAgainst) {
      stats.wins++;
    } else if (goalsFor < goalsAgainst) {
      stats.losses++;
    } else {
      stats.draws++;
    }

    return this.update(teamId, { stats } as Partial<Team>);
  }

  // Obtener clasificación (todos los equipos ordenados por puntos)
  async getStandings(season?: string, gender?: Gender): Promise<Array<Team & { points: number }>> {
    let teams = await this.getActiveTeams();

    if (season) {
      teams = teams.filter(t => t.season === season);
    }

    if (gender) {
      teams = teams.filter(t => t.gender === gender);
    }

    // Calcular puntos y ordenar
    const teamsWithPoints = teams.map(team => ({
      ...team,
      points: (team.stats?.wins || 0) * 3 + (team.stats?.draws || 0),
    }));

    return teamsWithPoints.sort((a, b) => {
      // Primero por puntos
      if (b.points !== a.points) return b.points - a.points;
      // Luego por diferencia de goles
      const diffA = (a.stats?.goalsFor || 0) - (a.stats?.goalsAgainst || 0);
      const diffB = (b.stats?.goalsFor || 0) - (b.stats?.goalsAgainst || 0);
      return diffB - diffA;
    });
  }

  // Desactivar equipo
  async deactivate(teamId: string): Promise<Team | null> {
    return this.update(teamId, { isActive: false } as Partial<Team>);
  }

  // Activar equipo
  async activate(teamId: string): Promise<Team | null> {
    return this.update(teamId, { isActive: true } as Partial<Team>);
  }
}

export const teamService = new TeamService();
