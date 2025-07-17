export interface PublishVideoBody {
  title: string;
  description: string;
  tags: string[] | string;
}

export interface UpdateVideoBody extends PublishVideoBody { }
