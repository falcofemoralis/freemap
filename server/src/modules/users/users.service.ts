import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../auth/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findUserById(id: string): Promise<User | null> {
    return this.userModel.findById(id);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username });
  }

  async addUserExperience(id: string, amount: number): Promise<number> {
    const user = await this.userModel.findOneAndUpdate({ _id: id }, { $inc: { experience: amount } }, { new: true });
    return user.experience;
  }

  async getUserExperience(id: string): Promise<number> {
    return (await this.userModel.findById(id))?.experience ?? 0;
  }
}
