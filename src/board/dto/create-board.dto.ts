import {User} from "../../users/entities/user.entity";

export class CreateBoardDto {
    title: string;
    description: string;
    owner: User;
}
