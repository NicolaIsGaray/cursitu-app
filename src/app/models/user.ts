import { Classroom } from "./classroom";
import { Group } from "./group";
import { Subjects } from "./subjects";

export class User {
    id!: number;
    email!: string;
    nombre!: string;
    clave!: string;
    dni!: string;
    cursosDictados?: Set<Classroom>;
    isActive!: boolean;
    materias?: Set<Subjects>;
    gruposAdministrados?: Set<Group>;
    cursosCompuestos?: Set<Classroom>;
    gruposIntegrados?: Set<Group>;
    roles!: string[];
    comision!: string;
    requestForTeacherRole?: boolean;
}