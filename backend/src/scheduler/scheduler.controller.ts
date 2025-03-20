import { Controller, Get, Post, Body } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get('interval')
  getInterval() {
    return { interval: this.schedulerService.getInterval() };
  }

  @Post('interval')
  setInterval(@Body() data: { interval: '1h' | '6h' }) {
    return { interval: this.schedulerService.setInterval(data.interval) };
  }
}
