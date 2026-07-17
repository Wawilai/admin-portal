import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

import {
  Button,
  DataTable,
  EmptyState,
  Field,
  FilterChip,
  HelperNote,
  InlineAlert,
  Input,
  LoadingSkeleton,
  PageHeader,
  Pagination,
  Panel,
  PanelBody,
  PanelHeader,
  PreviewRow,
  RecordCard,
  RecordField,
  RecordList,
  Select,
  StatusBadge,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Toolbar,
} from "@/components/ui-portal";
import { apiGet, apiWrite, buildApiPath, extractErrorDetail } from "@/lib/api";
import { formatDateOnly } from "@/lib/formatters";
import type { PaginatedResponse, SubscriptionRow } from "@/lib/types";

export const Route = createFileRoute("/_app/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscriptions - Rerkdee Admin" },
      {
        name: "description",
        content: "Manage premium access, trial grants, and manual revocations.",
      },
    ],
  }),
  component: SubscriptionsPage,
});

const PRESETS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "active", label: "ใช้งานอยู่" },
  { id: "expired", label: "หมดอายุ" },
  { id: "trial", label: "ทดลอง/โปรโม" },
  { id: "expiring_soon", label: "ใกล้หมดอายุ" },
] as const;

type Preset = (typeof PRESETS)[number]["id"];
type SortKey = "expires_at" | "user" | "tier" | "days_left";
type SortDir = "asc" | "desc";

// A promo grant is stored as tier 'premium' with platform/source 'promo';
// surface it as its own badge so it isn't mistaken for a paid subscription.
function isPromoRow(row: SubscriptionRow) {
  return row.source?.toLowerCase().includes("promo") ?? false;
}

function tierLabel(row: SubscriptionRow) {
  if (row.tier.toLowerCase().includes("trial")) return "ทดลองใช้";
  if (isPromoRow(row)) return "โปรโมชั่น";
  if (row.tier.toLowerCase().includes("premium")) return "พรีเมียม";
  return row.tier;
}

function statusBadge(row: SubscriptionRow) {
  if (!row.active) {
    return <StatusBadge variant="expired">หมดอายุ</StatusBadge>;
  }
  if (isPromoRow(row)) {
    return <StatusBadge variant="trial">โปรโมชั่น</StatusBadge>;
  }
  if (row.tier.toLowerCase().includes("trial")) {
    return <StatusBadge variant="trial">ทดลอง</StatusBadge>;
  }
  return <StatusBadge variant="active">ใช้งานอยู่</StatusBadge>;
}

function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [preset, setPreset] = useState<Preset>("all");
  const [sortKey, setSortKey] = useState<SortKey>("expires_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [productId, setProductId] = useState("premium_monthly");
  const [platform, setPlatform] = useState("manual");
  const [tier, setTier] = useState("premium");
  const [durationDays, setDurationDays] = useState("30");
  const [expiresAt, setExpiresAt] = useState("");

  const [selected, setSelected] = useState<string[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  const subscriptionsQuery = useQuery({
    queryKey: ["subscriptions", search, preset, sortKey, sortDir, page, pageSize],
    queryFn: () =>
      apiGet<PaginatedResponse<SubscriptionRow>>(
        buildApiPath("/subscriptions", {
          search,
          preset,
          sort_by: sortKey,
          sort_dir: sortDir,
          page,
          page_size: pageSize,
        }),
      ),
  });

  useEffect(() => {
    setSelected([]);
  }, [page, preset, search, sortDir, sortKey]);

  const grantMutation = useMutation({
    mutationFn: () =>
      apiWrite<{ ok: boolean }>("/subscriptions", {
        userId: userId.trim(),
        email: email.trim() || undefined,
        productId,
        platform,
        tier,
        durationDays: expiresAt ? undefined : Number(durationDays),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      }),
    onSuccess: async () => {
      setFlash("ให้สิทธิ์เรียบร้อยแล้ว");
      setError(null);
      setUserId("");
      setEmail("");
      setTier("premium");
      setDurationDays("30");
      setExpiresAt("");
      await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "ให้สิทธิ์ไม่สำเร็จ"));
      setFlash(null);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      apiWrite<{ ok: boolean }>(`/subscriptions/${targetUserId}/revoke`, {}),
    onSuccess: async () => {
      setFlash("ยกเลิกสิทธิ์เรียบร้อยแล้ว");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "ยกเลิกสิทธิ์ไม่สำเร็จ"));
      setFlash(null);
    },
  });

  const bulkRevokeMutation = useMutation({
    mutationFn: (userIds: string[]) =>
      apiWrite<{ ok: boolean; affected: number }>("/subscriptions/bulk-revoke", {
        userIds,
      }),
    onSuccess: async (result) => {
      setFlash(`ยกเลิกสิทธิ์แล้ว ${result.affected} รายการ`);
      setError(null);
      setSelected([]);
      await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "ยกเลิกหลายรายการไม่สำเร็จ"));
      setFlash(null);
    },
  });

  const rows = subscriptionsQuery.data?.items ?? [];
  const total = subscriptionsQuery.data?.total ?? 0;
  const sortValue = useMemo(() => `${sortKey}:${sortDir}`, [sortDir, sortKey]);
  const numericDuration = Number(durationDays);
  const effectiveDuration =
    Number.isFinite(numericDuration) && numericDuration > 0
      ? numericDuration
      : productId === "premium_yearly"
        ? 365
        : productId === "trial_10_days"
          ? 10
          : 30;
  const canGrant =
    userId.trim().length > 0 &&
    (Boolean(expiresAt) || (Number.isFinite(numericDuration) && numericDuration > 0));
  const accessSummary = tier === "trial" ? "สิทธิ์ทดลองใช้" : "สิทธิ์พรีเมียม";
  const expirySummary = expiresAt
    ? new Date(expiresAt).toLocaleString()
    : `หมดอายุอัตโนมัติใน ${effectiveDuration} วัน`;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="สมาชิก / การสมัครใช้งาน"
        subtitle="ให้สิทธิ์ ตรวจสอบ และยกเลิกสิทธิ์พรีเมียมของผู้ใช้"
        actions={
          <span className="text-[11px] text-muted-foreground tabular-nums">
            ทั้งหมด {total.toLocaleString()} รายการ
          </span>
        }
      />

      {flash ? <InlineAlert variant="success">{flash}</InlineAlert> : null}
      {error ? <InlineAlert variant="danger">{error}</InlineAlert> : null}
      {subscriptionsQuery.isError ? (
        <InlineAlert variant="danger" title="โหลดรายการสมาชิกไม่สำเร็จ">
          ตรวจสอบการเชื่อมต่อระบบ หรือปรับตัวกรองแล้วลองใหม่อีกครั้ง
        </InlineAlert>
      ) : null}

      <Panel>
        <PanelHeader
          title="ให้สิทธิ์ผู้ใช้"
          description="เลือกชุดสำเร็จรูปสำหรับงานที่ใช้บ่อย แล้วตรวจวันหมดอายุก่อนบันทึก"
        />
        <PanelBody className="flex flex-col gap-5">
          <HelperNote>
            <div className="flex flex-col gap-1.5">
              <PreviewRow label="ประเภทสิทธิ์" value={accessSummary} />
              <PreviewRow label="ช่องทางที่มา" value={platform} />
              <PreviewRow label="วันหมดอายุ" value={expirySummary} />
            </div>
          </HelperNote>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => {
                setProductId("premium_monthly");
                setTier("premium");
                setPlatform("manual");
                setDurationDays("30");
                setExpiresAt("");
              }}
            >
              พรีเมียม รายเดือน
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setProductId("premium_yearly");
                setTier("premium");
                setPlatform("manual");
                setDurationDays("365");
                setExpiresAt("");
              }}
            >
              พรีเมียม รายปี
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setProductId("trial_10_days");
                setTier("trial");
                setPlatform("promo");
                setDurationDays("10");
                setExpiresAt("");
              }}
            >
              ทดลองใช้ 10 วัน
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="รหัสผู้ใช้ (User ID)">
              <Input
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="เช่น uid_001"
              />
            </Field>
            <Field label="อีเมล (ไม่บังคับ)">
              <Input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="user@example.com"
              />
            </Field>
            <Field label="แพ็กเกจ">
              <Select value={productId} onChange={(event) => setProductId(event.target.value)}>
                <option value="premium_monthly">พรีเมียม รายเดือน</option>
                <option value="premium_yearly">พรีเมียม รายปี</option>
                <option value="trial_10_days">ทดลองใช้ 10 วัน</option>
                <option value="manual_override">กำหนดเอง</option>
              </Select>
            </Field>
            <Field label="ช่องทางที่มา">
              <Select value={platform} onChange={(event) => setPlatform(event.target.value)}>
                <option value="manual">ให้เองโดยแอดมิน</option>
                <option value="promo">โปรโมชั่น</option>
                <option value="ios">App Store (iOS)</option>
                <option value="android">Google Play</option>
                <option value="stripe">Stripe</option>
              </Select>
            </Field>
            <Field label="ประเภทสิทธิ์">
              <Select value={tier} onChange={(event) => setTier(event.target.value)}>
                <option value="premium">พรีเมียม (ใช้ได้ไม่จำกัด)</option>
                <option value="trial">ทดลองใช้ (ใช้ได้ไม่จำกัด มีวันหมด)</option>
              </Select>
            </Field>
            <Field label="จำนวนวัน">
              <Input
                type="number"
                min="1"
                max="3650"
                value={durationDays}
                onChange={(event) => setDurationDays(event.target.value)}
                disabled={Boolean(expiresAt)}
              />
            </Field>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            <Field label="กำหนดวันหมดอายุเอง (ไม่บังคับ)">
              <Input
                type="datetime-local"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
              />
            </Field>
            <HelperNote>
              ใช้ช่องนี้เมื่อต้องการกู้คืนการซื้อ หรือกำหนดวันหมดอายุให้ตรงกับสิทธิ์จากภายนอก ·
              ถ้าเว้นว่าง ระบบจะใช้ "จำนวนวัน" ด้านบนแทน
            </HelperNote>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                if (productId === "premium_yearly") {
                  setTier("premium");
                  setDurationDays("365");
                } else if (productId === "trial_10_days") {
                  setTier("trial");
                  setDurationDays("10");
                } else {
                  setTier("premium");
                  setDurationDays("30");
                }
                setExpiresAt("");
              }}
            >
              ตั้งค่าตามแพ็กเกจ
            </Button>
            <Button
              variant="primary"
              onClick={() => grantMutation.mutate()}
              disabled={grantMutation.isPending || !canGrant}
            >
              {grantMutation.isPending ? "กำลังบันทึก..." : "ให้สิทธิ์"}
            </Button>
          </div>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader
          title="รายการสมาชิกปัจจุบัน"
          description="ค้นหา กรอง และยกเลิกสิทธิ์ได้จากหน้านี้"
        />
        <PanelBody className="px-0 py-0">
          <Toolbar
            left={
              <>
                <div className="relative w-full sm:w-72">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="ค้นหาอีเมลหรือรหัสผู้ใช้"
                    className="h-8 pl-7"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESETS.map((item) => (
                    <FilterChip
                      key={item.id}
                      active={preset === item.id}
                      onClick={() => {
                        setPreset(item.id);
                        setPage(1);
                      }}
                    >
                      {item.label}
                    </FilterChip>
                  ))}
                </div>
              </>
            }
            right={
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  เรียงตาม
                  <div className="relative">
                    <select
                      value={sortValue}
                      onChange={(event) => {
                        const [nextKey, nextDir] = event.target.value.split(":") as [
                          SortKey,
                          SortDir,
                        ];
                        setSortKey(nextKey);
                        setSortDir(nextDir);
                        setPage(1);
                      }}
                      className="h-8 appearance-none rounded-md border border-input bg-background pl-2.5 pr-7 text-[12px] font-medium text-foreground outline-none transition-colors hover:bg-muted focus:border-ring focus:ring-2 focus:ring-ring/40"
                    >
                      <option value="expires_at:desc">วันหมดอายุ · ล่าสุด</option>
                      <option value="expires_at:asc">วันหมดอายุ · เร็วสุด</option>
                      <option value="days_left:asc">วันคงเหลือ · น้อยไปมาก</option>
                      <option value="days_left:desc">วันคงเหลือ · มากไปน้อย</option>
                      <option value="user:asc">ผู้ใช้ · ก→ฮ</option>
                      <option value="user:desc">ผู้ใช้ · ฮ→ก</option>
                      <option value="tier:asc">ประเภทสิทธิ์ · ก→ฮ</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </label>
                {selected.length > 0 ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => bulkRevokeMutation.mutate(selected)}
                    disabled={bulkRevokeMutation.isPending}
                  >
                    {bulkRevokeMutation.isPending ? "กำลังยกเลิก..." : `ยกเลิก ${selected.length} รายการ`}
                  </Button>
                ) : (
                  <span className="text-[12px] text-muted-foreground tabular-nums">
                    {total} รายการ
                  </span>
                )}
              </div>
            }
          />

          {subscriptionsQuery.isLoading ? (
            <div className="p-5">
              <LoadingSkeleton className="h-44" />
            </div>
          ) : rows.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState
                title="ไม่มีรายการสมาชิก"
                description="ไม่มีข้อมูลที่ตรงกับตัวกรองที่เลือก"
              />
            </div>
          ) : (
            <DataTable>
              <THead>
                <TR>
                  <TH className="w-10">เลือก</TH>
                  <TH>ผู้ใช้</TH>
                  <TH>ประเภทสิทธิ์</TH>
                  <TH>ที่มา</TH>
                  <TH>หมดอายุ</TH>
                  <TH>สถานะ</TH>
                  <TH className="text-right">จัดการ</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((row) => {
                  const checked = selected.includes(row.userId);
                  return (
                    <TR key={row.userId} selected={checked}>
                      <TD>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelected((current) =>
                              checked
                                ? current.filter((item) => item !== row.userId)
                                : [...current, row.userId],
                            )
                          }
                        />
                      </TD>
                      <TD>
                        <div className="font-medium text-foreground">{row.email}</div>
                        <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                          {row.userId}
                        </div>
                      </TD>
                      <TD>{tierLabel(row)}</TD>
                      <TD className="text-muted-foreground">{row.source}</TD>
                      <TD className="text-muted-foreground">{formatDateOnly(row.expiresAt)}</TD>
                      <TD>{statusBadge(row)}</TD>
                      <TD className="text-right">
                        <Button size="sm" onClick={() => revokeMutation.mutate(row.userId)}>
                          ยกเลิกสิทธิ์
                        </Button>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </DataTable>
          )}

          {!subscriptionsQuery.isLoading && rows.length > 0 ? (
            <RecordList>
              {rows.map((row) => (
                <RecordCard key={row.userId}>
                  <RecordField>
                    <span className="min-w-0 truncate font-medium text-foreground">{row.email}</span>
                    {statusBadge(row)}
                  </RecordField>
                  <RecordField label="รหัสผู้ใช้">
                    <span className="font-mono text-[12px]">{row.userId}</span>
                  </RecordField>
                  <RecordField label="ประเภทสิทธิ์">{tierLabel(row)}</RecordField>
                  <RecordField label="ที่มา">{row.source}</RecordField>
                  <RecordField label="หมดอายุ">{formatDateOnly(row.expiresAt)}</RecordField>
                  <div className="border-t border-border/70 pt-2">
                    <Button size="sm" onClick={() => revokeMutation.mutate(row.userId)}>
                      ยกเลิกสิทธิ์
                    </Button>
                  </div>
                </RecordCard>
              ))}
            </RecordList>
          ) : null}

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </PanelBody>
      </Panel>
    </div>
  );
}
