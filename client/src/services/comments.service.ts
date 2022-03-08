import { errorStore } from './../store/error.store';
import { AxiosError } from 'axios';
import { IComment } from './../types/IComment';
import { axiosInstance, headers } from './index';

export default class CommentsService {
  private static API_URL = '/comments';

  static async addComment(featureId: string, text: string, parentCommentId?: string): Promise<IComment> {
    try {
      const body = { featureId, text, parentCommentId };
      const { data } = await axiosInstance.post<IComment>(`${this.API_URL}`, body, { headers: headers() });
      return data;
    } catch (e: AxiosError | unknown) {
      errorStore.errorHandle(e);
      throw e;
    }
  }
}
