import { IsEnum, IsNumber, IsString } from "class-validator";

export class ProductDto {
    @IsString()
    readonly name: string;

    @IsNumber()
    readonly price: number;

    @IsEnum(['Perishable', 'Non-perishable'], {
        message: 'Type must be either Perishable or Non-perishable',
    })
    readonly type: 'Perishable' | 'Non-perishable';
}
