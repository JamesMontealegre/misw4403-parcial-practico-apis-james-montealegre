import { IsEnum, IsNumber, IsString } from "class-validator";

export class ProductDto {
    @IsString()
    readonly name: string;

    @IsNumber()
    readonly price: number;

    @IsString()
    readonly type: string;
}
