import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly cats: any[] = [];

  create(cat: any) {
    this.cats.push(cat);
  }

  findAll(): any[] {
    return this.cats;
  }
}
