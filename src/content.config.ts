import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    title: z.string(),
    businessValue: z.number().min(1).max(5),
    risk: z.enum(['Low', 'Medium', 'High']),
    points: z.number().min(0),
    status: z.enum(['Backlog', 'Current', 'Done']),
    iteration: z.string().optional(),
    assignedPair: z.array(z.string()).default([]),
    isTDD: z.boolean().default(false),
    acceptanceCriteria: z.array(z.string()).default([]),
    createdBy: z.enum(['Client', 'Programmer']).default('Client'),
    estimatedBy: z.string().optional(),
    createdAt: z.coerce.date().optional(),
  }),
});

const iterations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/iterations' }),
  schema: z.object({
    name: z.string(),
    number: z.number(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    velocity: z.number().default(0),
    capacity: z.number(),
    status: z.enum(['Planning', 'Active', 'Completed']).default('Planning'),
  }),
});

const project = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/project' }),
  schema: z.object({
    metaphor: z.string(),
    teamName: z.string().optional(),
    roles: z
      .array(
        z.object({
          name: z.string(),
          role: z.enum(['Coach', 'Gestor', 'Cliente', 'Programmer/Tester', 'Tracker']),
        }),
      )
      .default([]),
    cadence: z.string().default('1 week'),
    sustainablePaceHours: z.number().default(40),
  }),
});

const logs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/logs' }),
  schema: z.object({
    type: z.enum(['pair-session', 'refactor', 'debt']),
    title: z.string(),
    date: z.coerce.date(),
    participants: z.array(z.string()).default([]),
    durationMinutes: z.number().optional(),
    status: z.enum(['Open', 'Resolved']).default('Open'),
    relatedStory: z.string().optional(),

    // Code traceability fields
    descripcion: z.string().optional(),
    prioridad: z.enum(['Alta', 'Media', 'Baja']).optional(),
    historiaId: z.string().optional(),
    estado: z.enum(['Pendiente', 'En Curso', 'Resuelto', 'Backlog']).optional(),
    responsableId: z.string().optional(),
    githubRepo: z.string().optional(),
    githubFiles: z
      .array(
        z.object({
          path: z.string(),
          description: z.string(),
          githubUrl: z.string(),
          lineStart: z.number().optional(),
          lineEnd: z.number().optional(),
        }),
      )
      .optional(),
    githubCommit: z.string().optional(),
    codeSnippet: z.string().optional(),
  }),
});

export const collections = { stories, iterations, project, logs };
