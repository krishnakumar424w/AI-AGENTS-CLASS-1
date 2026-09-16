import { createTool, ToolRegistry } from './tools.js';
import { Tool } from './types.js';

export interface StudentRecord {
  name: string;
  programme: string;
  semester: number;
  fee_balance: number;
  attendance_pct: number;
}

export interface ReminderRecord {
  title: string;
  due: string;
  note?: string;
}

export const INITIAL_STUDENTS: Record<string, StudentRecord> = {
  '21CS045': {
    name: 'Priya R',
    programme: 'B.E. CSE',
    semester: 6,
    fee_balance: 18500,
    attendance_pct: 81,
  },
  '21IT012': {
    name: 'Karthik S',
    programme: 'B.Tech IT',
    semester: 6,
    fee_balance: 0,
    attendance_pct: 68,
  },
  '22EC101': {
    name: 'Aishwarya M',
    programme: 'B.E. ECE',
    semester: 4,
    fee_balance: 42000,
    attendance_pct: 92,
  },
};

let STUDENTS: Record<string, StudentRecord> = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
let REMINDERS: ReminderRecord[] = [];

export function getCampusData() {
  return {
    students: STUDENTS,
    reminders: REMINDERS,
  };
}

export function resetCampusData() {
  STUDENTS = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
  REMINDERS = [];
  return getCampusData();
}

export const getStudentTool: Tool = createTool(
  'get_student',
  'Look up a student\'s record: name, programme, semester, fee balance, attendance. Call this whenever a roll number is mentioned and you need any detail about that student. Never guess a student\'s details.',
  {
    type: 'object',
    properties: {
      roll_number: {
        type: 'string',
        description: 'The roll number, for example 21CS045.',
      },
    },
    required: ['roll_number'],
  },
  (args: { roll_number: string }) => {
    const raw = String(args.roll_number || '').trim().toUpperCase();
    const record = STUDENTS[raw];
    if (!record) {
      const known = Object.keys(STUDENTS).sort().join(', ');
      const err = new Error(`No student with roll number '${raw}'. Known roll numbers: ${known}`);
      err.name = 'KeyError';
      throw err;
    }
    return { roll_number: raw, ...record };
  }
);

export const listStudentsBelowAttendanceTool: Tool = createTool(
  'list_students_below_attendance',
  'List students whose attendance is below a percentage threshold. Call this for questions about attendance shortfall across students, rather than looking up each student individually.',
  {
    type: 'object',
    properties: {
      threshold_pct: {
        type: 'integer',
        description: 'Attendance percentage cut-off, for example 75.',
      },
    },
    required: ['threshold_pct'],
  },
  (args: { threshold_pct: number }) => {
    const threshold = Number(args.threshold_pct);
    const flagged = Object.entries(STUDENTS)
      .filter(([_, rec]) => rec.attendance_pct < threshold)
      .map(([roll, rec]) => ({
        roll_number: roll,
        name: rec.name,
        attendance_pct: rec.attendance_pct,
      }));

    return {
      threshold_pct: threshold,
      count: flagged.length,
      students: flagged,
    };
  }
);

export const createReminderTool: Tool = createTool(
  'create_reminder',
  'Create a dated reminder. Call this when the user asks to be reminded, to schedule a follow-up, or to flag something for later action.',
  {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Short reminder title.',
      },
      days_from_now: {
        type: 'integer',
        description: 'How many days ahead the reminder should fire.',
      },
      note: {
        type: 'string',
        description: 'Optional additional detail.',
      },
    },
    required: ['title', 'days_from_now'],
  },
  (args: { title: string; days_from_now: number; note?: string }) => {
    const days = parseInt(String(args.days_from_now), 10) || 0;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const dueStr = targetDate.toISOString().split('T')[0];

    const reminder: ReminderRecord = {
      title: args.title,
      due: dueStr,
      note: args.note || '',
    };
    REMINDERS.push(reminder);

    return {
      created: true,
      title: args.title,
      due: dueStr,
    };
  }
);

export function campusRegistry(): ToolRegistry {
  return new ToolRegistry([
    getStudentTool,
    listStudentsBelowAttendanceTool,
    createReminderTool,
  ]);
}

export const CAMPUS_INSTRUCTIONS =
  'You are a campus records assistant for SoDak EduTech. ' +
  'Answer only from tool results - never invent student data. ' +
  'If a tool returns an error, read it, correct your approach, and try again. ' +
  'Be concise: two or three sentences unless asked for detail.';
