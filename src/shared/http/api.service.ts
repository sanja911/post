import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class ApiService {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'https://jsonplaceholder.typicode.com',
    });
  }

  async get(url: string) {
    return this.axiosInstance.get(url);
  }

  async post(url: string, data: any) {
    return this.axiosInstance.post(url, data, {
      headers: {
        'content-type': 'application/json',
      },
    });
  }

  async getById(url: string) {
    return this.axiosInstance.get(url);
  }

  async put(url: string, data: any) {
    return this.axiosInstance.put(url, data, {
      headers: {
        'content-type': 'application/json',
      },
    });
  }

  async patch(url: string, data: any) {
    return this.axiosInstance.patch(url, data, {
      headers: {
        'content-type': 'application/json',
      },
    });
  }

  async delete(url: string) {
    return this.axiosInstance.delete(url);
  }
}
