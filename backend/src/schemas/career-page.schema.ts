import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CareerPageDocument = CareerPage & Document;

@Schema()
export class CareerPage {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  name: string;
}

export const CareerPageSchema = SchemaFactory.createForClass(CareerPage);
