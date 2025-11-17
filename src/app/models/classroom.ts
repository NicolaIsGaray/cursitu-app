import { User } from "./user";

export class Classroom {
    id!: number;
    numeroCurso!: number;
    year!: string;
    comision!: string;
    alumnos!: Set<User>;
    profesores!: Set<User>;
}