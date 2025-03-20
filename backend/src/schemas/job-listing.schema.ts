import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobListingDocument = JobListing & Document;

@Schema()
export class JobListing {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  company: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  source: string;

  @Prop({ required: true })
  scrapedAt: Date;
}

export const JobListingSchema = SchemaFactory.createForClass(JobListing);
