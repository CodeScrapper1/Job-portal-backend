import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UpdateStatusDto } from './application.dto';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async applyJob(applicantId: string, jobId: string) {
    if (!jobId) throw new BadRequestException('Job id required');

    const existingApplication = await this.prisma.application.findFirst({
      where: { jobId, applicantId },
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied for this job.');
    }

    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new BadRequestException('job not found');
    }

    const newApplication = await this.prisma.application.create({
      data: {
        jobId,
        applicantId,
      },
    });

    return newApplication;
  }

  // get applied job by user
  async getAppliedJobs(applicantId: string) {
    const applications = await this.prisma.application.findMany({
      where: { applicantId },
      orderBy: { createdAt: 'desc' },
      include: {
        job: { include: { company: true } },
      },
    });

    if (!applications || applications?.length == 0) {
      throw new NotFoundException('no applications found');
    }

    return applications;
  }

  // get all applicants by job
  async getApplicants(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          orderBy: { createdAt: 'desc' },
          include: { applicant: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  // update status
  async updateStatus(id: string, updateStatusDto: UpdateStatusDto) {
    const { status } = updateStatusDto;

    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const updatedApplication = await this.prisma.application.update({
      where: { id },
      data: { status: status?.toLowerCase() },
    });

    return updatedApplication;
  }
}
