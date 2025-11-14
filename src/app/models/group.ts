import { User } from "./user";

export class Group {
    id!: number;
    nombre!: string;
    limite!: number;
    miembros!: Set<User>;
    pendientes!: Set<User>;
}