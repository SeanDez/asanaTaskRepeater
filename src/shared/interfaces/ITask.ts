export default interface ITask {
  name: string;
  gid?: string;
  notes: string;
  tags: string[];
  projects?: string[];
  due_at: string | undefined;
  due_on: string;
}
