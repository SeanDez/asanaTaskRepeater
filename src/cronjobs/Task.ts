export default class Task {
  constructor(
    public name: string,
    public gid: string,
    public notes: string,
    public tags: string[],
  ) {}
}
