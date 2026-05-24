"use client";

import {
  BranchesOutlined,
  CloudUploadOutlined,
  RocketOutlined,
  SearchOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Pagination,
  Rate,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";

import type { MarketplaceTemplate } from "@shared/types/api";
import {
  useForkTemplate,
  useMarketplaceTemplates,
  usePromoteTemplate,
  usePublishTemplate,
  useRateTemplate,
} from "@/hooks/use-checklist-marketplace";
import { useAuthSession } from "@/hooks/use-auth-session";

const { Text, Title } = Typography;
const { Option } = Select;

const MODULE_COLORS: Record<string, string> = {
  AGRI: "green",
  BUILDING: "blue",
  ENVIRONMENTAL: "cyan",
  FIRE: "red",
  FOOD: "orange",
  SANITATION: "purple",
};

function StarRating({ avg, count }: { avg: number | null; count: number }) {
  if (count === 0) return <Text type="secondary">No ratings yet</Text>;
  return (
    <Space size={4}>
      <StarFilled style={{ color: "#faad14" }} />
      <Text strong>{(avg ?? 0).toFixed(1)}</Text>
      <Text type="secondary">({count})</Text>
    </Space>
  );
}

interface TemplateCardProps {
  isAdmin: boolean;
  onFork: (id: string) => void;
  onPromote: (id: string) => void;
  onPublish: (id: string) => void;
  onRate: (template: MarketplaceTemplate) => void;
  template: MarketplaceTemplate;
}

function TemplateCard({
  isAdmin,
  onFork,
  onPromote,
  onPublish,
  onRate,
  template,
}: TemplateCardProps) {
  const moduleColor = MODULE_COLORS[template.module] ?? "default";

  return (
    <Card
      size="small"
      title={
        <Space orientation="vertical" size={2} style={{ width: "100%" }}>
          <Space>
            <Tag color={moduleColor}>{template.module}</Tag>
            {template.lguId === null && (
              <Tag color="gold">Platform-default</Tag>
            )}
            {!template.isMarketplace && (
              <Tag color="default">Not published</Tag>
            )}
          </Space>
          <Title level={5} style={{ margin: 0 }}>
            {template.title}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {template.code}
          </Text>
        </Space>
      }
      extra={
        <Space>
          <StarRating avg={template.avgRating} count={template.ratingCount} />
        </Space>
      }
    >
      {template.description && (
        <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
          {template.description}
        </Text>
      )}

      <Space style={{ marginBottom: 12 }}>
        <Text type="secondary">
          Forks: <strong>{template.forkCount}</strong>
        </Text>
        <Text type="secondary">v{template.version}</Text>
        {template.forkedFromId && (
          <Tooltip title={`Forked from ${template.forkedFromId}`}>
            <BranchesOutlined />
          </Tooltip>
        )}
      </Space>

      <Space wrap>
        <Button
          icon={<BranchesOutlined />}
          size="small"
          onClick={() => onFork(template.id)}
          title="Fork this template into your LGU"
        >
          Fork
        </Button>

        <Button
          icon={<StarOutlined />}
          size="small"
          onClick={() => onRate(template)}
          title="Rate this template"
        >
          Rate
        </Button>

        {isAdmin && !template.isMarketplace && (
          <Button
            icon={<CloudUploadOutlined />}
            size="small"
            onClick={() => onPublish(template.id)}
            title="Publish to marketplace"
          >
            Publish
          </Button>
        )}

        {isAdmin && template.lguId !== null && (
          <Button
            icon={<RocketOutlined />}
            size="small"
            onClick={() => onPromote(template.id)}
            title="Promote to platform-default"
          >
            Promote
          </Button>
        )}
      </Space>
    </Card>
  );
}

interface RateModalProps {
  onClose: () => void;
  onSubmit: (rating: number, comment?: string) => void;
  open: boolean;
  template: MarketplaceTemplate | null;
}

function RateModal({ onClose, onSubmit, open, template }: RateModalProps) {
  const [form] = Form.useForm<{ comment?: string; rating: number }>();

  function handleOk() {
    void form.validateFields().then((values) => {
      onSubmit(values.rating, values.comment);
      form.resetFields();
    });
  }

  return (
    <Modal
      open={open}
      title={`Rate: ${template?.title ?? ""}`}
      onCancel={onClose}
      onOk={handleOk}
      okText="Submit rating"
    >
      <Form form={form} layout="vertical" initialValues={{ rating: 3 }}>
        <Form.Item
          label="Rating (1–5 stars)"
          name="rating"
          rules={[{ required: true, message: "Please select a rating" }]}
        >
          <Rate />
        </Form.Item>
        <Form.Item label="Comment (optional)" name="comment">
          <Input.TextArea rows={3} maxLength={500} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export function ChecklistMarketplace() {
  const { user } = useAuthSession();
  const isAdmin =
    user?.role === "admin" ||
    user?.role === "lgu_admin" ||
    user?.role === "office_supervisor";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [module, setModule] = useState<string | undefined>();
  const [ratingTarget, setRatingTarget] = useState<MarketplaceTemplate | null>(
    null,
  );

  const { data, isLoading } = useMarketplaceTemplates({
    limit: 12,
    module,
    page,
    search: search || undefined,
  });

  const forkMutation = useForkTemplate();
  const publishMutation = usePublishTemplate();
  const promoteMutation = usePromoteTemplate();
  const rateMutation = useRateTemplate();

  function handleFork(id: string) {
    Modal.confirm({
      title: "Fork this template?",
      content: "A copy will be created in your LGU's namespace.",
      onOk: () => forkMutation.mutate(id),
    });
  }

  function handlePublish(id: string) {
    Modal.confirm({
      title: "Publish to marketplace?",
      content: "This template will be visible to all LGUs.",
      onOk: () => publishMutation.mutate(id),
    });
  }

  function handlePromote(id: string) {
    Modal.confirm({
      title: "Promote to platform-default?",
      content:
        "The LGU namespace will be removed; this becomes a shared platform template.",
      onOk: () => promoteMutation.mutate(id),
    });
  }

  function handleRateSubmit(rating: number, comment?: string) {
    if (!ratingTarget) return;
    rateMutation.mutate(
      { rating, comment, templateId: ratingTarget.id },
      { onSuccess: () => setRatingTarget(null) },
    );
  }

  return (
    <>
      <Space orientation="vertical" style={{ width: "100%" }} size="middle">
        {/* Filters */}
        <Row gutter={12} align="middle">
          <Col xs={24} sm={12} md={10}>
            <Input
              allowClear
              placeholder="Search templates…"
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              allowClear
              placeholder="Filter by module"
              style={{ width: "100%" }}
              value={module}
              onChange={(v) => {
                setModule(v);
                setPage(1);
              }}
            >
              {Object.keys(MODULE_COLORS).map((m) => (
                <Option key={m} value={m}>
                  {m}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* Template grid */}
        {isLoading ? (
          <Spin />
        ) : (
          <Row gutter={[16, 16]}>
            {(data?.data ?? []).map((tpl) => (
              <Col key={tpl.id} xs={24} sm={12} lg={8}>
                <TemplateCard
                  isAdmin={isAdmin}
                  template={tpl}
                  onFork={handleFork}
                  onPublish={handlePublish}
                  onPromote={handlePromote}
                  onRate={setRatingTarget}
                />
              </Col>
            ))}
            {(data?.data ?? []).length === 0 && (
              <Col span={24}>
                <Text type="secondary">No marketplace templates found.</Text>
              </Col>
            )}
          </Row>
        )}

        {/* Pagination */}
        {(data?.meta.total ?? 0) > 12 && (
          <Pagination
            current={page}
            pageSize={12}
            total={data?.meta.total ?? 0}
            onChange={setPage}
            showSizeChanger={false}
          />
        )}
      </Space>

      <RateModal
        open={!!ratingTarget}
        template={ratingTarget}
        onClose={() => setRatingTarget(null)}
        onSubmit={handleRateSubmit}
      />
    </>
  );
}
