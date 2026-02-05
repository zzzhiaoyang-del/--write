-- 创建 AI 员工历史记录表
-- 每个 AI 员工的历史记录存储在同一个表中，通过 agent_id 区分

-- 1. 创建历史记录表
CREATE TABLE IF NOT EXISTS agent_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL, -- AI 员工的 ID（如 'ip-positioning-expert'）
  form_data JSONB NOT NULL, -- 用户填写的表单数据
  result TEXT NOT NULL, -- AI 生成的结果
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_agent_history_user_id ON agent_history(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_history_agent_id ON agent_history(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_history_user_agent ON agent_history(user_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_history_created_at ON agent_history(created_at DESC);

-- 3. 启用行级安全策略 (RLS)
ALTER TABLE agent_history ENABLE ROW LEVEL SECURITY;

-- 4. 创建 RLS 策略
-- 用户只能查看自己的历史记录
CREATE POLICY "Users can view their own history"
  ON agent_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能插入自己的历史记录
CREATE POLICY "Users can insert their own history"
  ON agent_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的历史记录
CREATE POLICY "Users can update their own history"
  ON agent_history
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 用户只能删除自己的历史记录
CREATE POLICY "Users can delete their own history"
  ON agent_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. 创建触发器
CREATE TRIGGER update_agent_history_updated_at
  BEFORE UPDATE ON agent_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. 添加注释
COMMENT ON TABLE agent_history IS 'AI 员工历史记录表，存储每个用户使用各个 AI 员工的历史记录';
COMMENT ON COLUMN agent_history.id IS '历史记录唯一 ID';
COMMENT ON COLUMN agent_history.user_id IS '用户 ID，关联 auth.users 表';
COMMENT ON COLUMN agent_history.agent_id IS 'AI 员工 ID，如 ip-positioning-expert';
COMMENT ON COLUMN agent_history.form_data IS '用户填写的表单数据（JSON 格式）';
COMMENT ON COLUMN agent_history.result IS 'AI 生成的结果文本';
COMMENT ON COLUMN agent_history.created_at IS '创建时间';
COMMENT ON COLUMN agent_history.updated_at IS '最后更新时间';
