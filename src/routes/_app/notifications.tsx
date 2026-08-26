import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import {
  Button,
  DataTable,
  EmptyState,
  Field,
  HelperNote,
  InlineAlert,
  Input,
  LoadingSkeleton,
  PageHeader,
  Panel,
  PanelBody,
  PanelHeader,
  Select,
  StatusBadge,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui-portal";
import { apiGet, apiWrite, extractErrorDetail } from "@/lib/api";
import { formatDateTime } from "@/lib/formatters";
import type { NotificationAudience, NotificationCampaign } from "@/lib/types";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications - Rerkdee Admin" },
      {
        name: "description",
        content: "Send test push notifications and review recent send history.",
      },
    ],
  }),
  component: NotificationsPage,
});

const AUDIENCE_LABELS: Record<string, string> = {
  all_users: "ผู้ใช้ทั้งหมด",
  free_tier: "กลุ่ม Free",
  trial_tier: "กลุ่ม Trial",
  premium_tier: "กลุ่ม Premium",
};

function NotificationsPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all_users");
  const [testToken, setTestToken] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audiencesQuery = useQuery({
    queryKey: ["notification-audiences"],
    queryFn: () => apiGet<{ items: NotificationAudience[] }>("/notifications/audiences"),
  });

  const campaignsQuery = useQuery({
    queryKey: ["notification-campaigns"],
    queryFn: () => apiGet<{ items: NotificationCampaign[] }>("/notifications/campaigns"),
  });

  const testSendMutation = useMutation({
    mutationFn: () =>
      apiWrite<{ ok: boolean }>("/notifications/test-send", {
        title: title.trim(),
        body: body.trim(),
        audience,
        testToken: testToken.trim(),
      }),
    onSuccess: async () => {
      setFlash("ส่งข้อความทดสอบสำเร็จ");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["notification-campaigns"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "ส่งข้อความทดสอบไม่สำเร็จ"));
      setFlash(null);
    },
  });

  const audiences = audiencesQuery.data?.items ?? [];
  const campaigns = campaignsQuery.data?.items ?? [];
  const canSend = title.trim().length > 0 && body.trim().length > 0 && testToken.trim().length > 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Notifications"
        subtitle="ส่งข้อความทดสอบไปยังอุปกรณ์เดียวก่อนตัดสินใจส่งจริง — หน้านี้ยังไม่รองรับการส่ง broadcast จริงไปยังทั้งกลุ่มเป้าหมาย"
      />

      {flash ? <InlineAlert variant="success">{flash}</InlineAlert> : null}
      {error ? <InlineAlert variant="danger">{error}</InlineAlert> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
        <Panel>
          <PanelHeader
            title="ส่งข้อความทดสอบ"
            description="ทดสอบเนื้อหาก่อนวางแผนแคมเปญจริง ใส่ FCM token ของอุปกรณ์ทดสอบเพื่อรับข้อความ"
          />
          <PanelBody className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="หัวข้อ">
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="เช่น ดวงประจำวันของคุณมาแล้ว"
                />
              </Field>
              <Field label="กลุ่มเป้าหมาย (อ้างอิงสำหรับบันทึก)">
                <Select value={audience} onChange={(event) => setAudience(event.target.value)}>
                  {Object.entries(AUDIENCE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="เนื้อหาข้อความ">
              <Input
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="ข้อความที่จะแสดงในการแจ้งเตือน"
              />
            </Field>
            <Field
              label="FCM token อุปกรณ์ทดสอบ"
              hint="ใช้ token จากอุปกรณ์ของทีมเท่านั้น — ข้อความจะส่งไปยังอุปกรณ์นี้เพียงเครื่องเดียว"
            >
              <Input
                value={testToken}
                onChange={(event) => setTestToken(event.target.value)}
                placeholder="วาง FCM token ที่นี่"
                className="font-mono text-xs"
              />
            </Field>
            <div className="flex items-center justify-end">
              <Button
                variant="primary"
                onClick={() => testSendMutation.mutate()}
                disabled={testSendMutation.isPending || !canSend}
              >
                {testSendMutation.isPending ? "กำลังส่ง..." : "ส่งข้อความทดสอบ"}
              </Button>
            </div>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="ขนาดกลุ่มเป้าหมาย" description="จำนวนอุปกรณ์ที่ลงทะเบียนรับการแจ้งเตือนในแต่ละกลุ่ม" />
          <PanelBody className="flex flex-col gap-3">
            {audiencesQuery.isLoading ? (
              <LoadingSkeleton className="h-32" />
            ) : (
              audiences.map((item) => (
                <HelperNote key={item.audience}>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">
                      {AUDIENCE_LABELS[item.audience] ?? item.audience}
                    </span>
                    <span className="tabular-nums font-medium text-foreground">
                      {item.device_count.toLocaleString()} เครื่อง
                    </span>
                  </div>
                </HelperNote>
              ))
            )}
          </PanelBody>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="ประวัติการส่งทดสอบ" description="ข้อความทดสอบล่าสุดที่ส่งจากหน้านี้" />
        <PanelBody className="px-0 py-0">
          {campaignsQuery.isLoading ? (
            <div className="p-5">
              <LoadingSkeleton className="h-40" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState title="ยังไม่มีประวัติ" description="ยังไม่มีการส่งข้อความทดสอบ" />
            </div>
          ) : (
            <DataTable>
              <THead>
                <TR>
                  <TH>หัวข้อ</TH>
                  <TH>เนื้อหา</TH>
                  <TH>กลุ่มเป้าหมาย</TH>
                  <TH>ส่งเมื่อ</TH>
                  <TH>สถานะ</TH>
                </TR>
              </THead>
              <TBody>
                {campaigns.map((campaign) => (
                  <TR key={campaign.id}>
                    <TD className="font-medium">{campaign.title}</TD>
                    <TD className="max-w-xs truncate text-muted-foreground">{campaign.body}</TD>
                    <TD>{AUDIENCE_LABELS[campaign.audience] ?? campaign.audience}</TD>
                    <TD className="text-muted-foreground">{formatDateTime(campaign.created_at)}</TD>
                    <TD>
                      {campaign.success ? (
                        <StatusBadge variant="success">สำเร็จ</StatusBadge>
                      ) : (
                        <StatusBadge variant="danger">ล้มเหลว</StatusBadge>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </DataTable>
          )}
        </PanelBody>
      </Panel>
    </div>
  );
}
