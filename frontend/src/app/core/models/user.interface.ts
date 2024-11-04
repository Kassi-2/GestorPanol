export interface UserRegister {
  rut: string;
  name: string;
  type: UserType;
  mail?: string;
  phoneNumber?: number;
  degree?: string;
  role?: string;
}

export interface UserEdit {
  rut?: string;
  name?: string;
  type?: UserType;
  mail?: string;
  phoneNumber?: number;
  degree?: string;
  role?: string;
}

export interface User {
  id: number;
  rut: string;
  name: string;
  mail?: string;
  phoneNumber?: number;
  type: UserType;
  student?: Student;
  assistant?: Assistant;
  teacher?: Teacher;
}

export interface UserStudent {
  id: number;
  rut: string;
  name: string;
  type: UserType;
  mail?: string;
  phoneNumber?: number;
  student: Student;
}

export interface UserAssitant {
  id: number;
  rut: string;
  name: string;
  type: UserType;
  mail?: string;
  phoneNumber?: number;
  assistant: Assistant;
}

export interface UserTeacher {
  id: number;
  rut: string;
  name: string;
  type: UserType;
  mail?: string;
  phoneNumber?: number;
  teacher: Teacher;
}

export interface Student {
  id: number;
  codeDegree: string;
}

export interface Assistant {
  id: number;
  role: string;
}

export interface Teacher {
  id: number;
}

export enum UserType {
  Student = 'Student',
  Teacher = 'Teacher',
  Assistant = 'Assistant',
}

export interface UserLogin {
  username: String;
  password: String;
}
