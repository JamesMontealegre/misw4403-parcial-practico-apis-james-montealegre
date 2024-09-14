import { IsString, Length } from "class-validator";

export class StoreDto {
    @IsString()
    readonly name: string;

    @IsString()
    @Length(3, 3, { message: 'City code must be exactly 3 characters long' })
    readonly city: string;

    @IsString()
    readonly address: string;
}
