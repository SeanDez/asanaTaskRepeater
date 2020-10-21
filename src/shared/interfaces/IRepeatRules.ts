export default interface IRepeatRules {
  local_id: number; // SERIAL primary key,
  project_gid: string; // TEXT not null,
  project_name: string // TEXT not null default "placeholder";
  task_gid: string; // TEXT not null,
  task_name: string; // TEXT not null default "placeholder";
  repeat_interval: number; // SMALLINT,
  repeat_unit: string; // TEXT, -- days, weeks, months
  start_timestamp: string; // TIMESTAMP not null,
  app_user_id: number; // INTEGER references app_user (local_id) on delete cascade
};
