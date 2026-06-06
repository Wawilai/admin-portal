import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  PageHeader,
  Panel,
  Toolbar,
  FilterChip,
  DataTable,
  THead,
  TH,
  TBody,
  TR,
  TD,
  StatusBadge,
  Pagination,
  EmptyState,
  InlineAlert,
  LoadingSkeleton,
} from "@/components/ui-portal";
import { Search, ChevronDown, Users as UsersIcon } from "lucide-react";
import { apiGet, buildApiPath } from "@/lib/api";
import { timeAgo } from "@/lib/formatters";
import type { PaginatedResponse, UserSummary } from "@/lib/types";

export const Route = createFileRoute("/_app/users/")({
  head: () => ({
    meta: [
      { title: "Users — Rerkdee Admin" },
      {
        name: "description",
        content: "Search, filter, and triage platform users.",
      },
    ],
  }),
  component: UsersPage,
});

const PRESETS = [
  { id: "all", label: "All" },
  { id: "premium", label: "Premium" },
  { id: "trial", label: "Trial" },
  { id: "free", label: "Free" },
  { id: "credits", label: "With credits" },
] as const;

type Preset = (typeof PRESETS)[number]["id"];
type SortKey = "last_active" | "credits" | "email" | "tier";
type SortDir = "asc" | "desc";

function tierBadge(tier: string) {
  const normalized = tier.toLowerCase();
  if (normalized.includes("premium") || normalized.includes("pro")) {
    return <StatusBadge variant="promo">Premium</StatusBadge>;
  }
  if (normalized.includes("trial")) {
    return <StatusBadge variant="trial">Trial</StatusBadge>;
  }
  return <StatusBadge variant="neutral">Free</StatusBadge>;
}

function UsersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [preset, setPreset] = useState<Preset>("all");
  const [sortKey, setSortKey] = useState<SortKey>("last_active");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const usersQuery = useQuery({
    queryKey: ["users", search, preset, sortKey, sortDir, page, pageSize],
    queryFn: () =>
      apiGet<PaginatedResponse<UserSummary>>(
        buildApiPath("/users", {
          search,
          preset,
          sort_by: sortKey,
          sort_dir: sortDir,
          page,
          page_size: pageSize,
        }),
      ),
  });

  const rows = usersQuery.data?.items ?? [];
  const total = usersQuery.data?.total ?? 0;

  const sortValue = useMemo(() => `${sortKey}:${sortDir}`, [sortDir, sortKey]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        subtitle="Search, filter, and triage platform users."
        actions={
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {total.toLocaleString()} users
          </span>
        }
      />

      {usersQuery.isError ? (
        <InlineAlert variant="danger" title="Unable to load users">
          Adjust your filters or try again in a moment.
        </InlineAlert>
      ) : null}

      <Panel>
        <Toolbar
          left={
            <>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by email or user id…"
                  className="h-8 w-72 rounded-md border border-input bg-background pl-7 pr-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/40"
                />
              </div>
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
            </>
          }
          right={
            <label className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              Sort
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
                  <option value="last_active:desc">Last active · newest</option>
                  <option value="last_active:asc">Last active · oldest</option>
                  <option value="credits:desc">Credits · high to low</option>
                  <option value="credits:asc">Credits · low to high</option>
                  <option value="email:asc">Email · A→Z</option>
                  <option value="email:desc">Email · Z→A</option>
                  <option value="tier:asc">Tier · A→Z</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              </div>
            </label>
          }
        />

        {usersQuery.isLoading ? (
          <div className="p-5">
            <LoadingSkeleton className="h-40" />
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-10">
            <EmptyState
              icon={UsersIcon}
              title="No users match"
              description="Try clearing the search or switching presets."
            />
          </div>
        ) : (
          <DataTable>
            <THead>
              <tr>
                <TH>User</TH>
                <TH>Tier</TH>
                <TH className="text-right">Credits</TH>
                <TH className="text-right">Remaining today</TH>
                <TH>Locale</TH>
                <TH className="text-right">Last active</TH>
              </tr>
            </THead>
            <TBody>
              {rows.map((user) => (
                <TR
                  key={user.userId}
                  onClick={() =>
                    navigate({
                      to: "/users/$userId",
                      params: { userId: user.userId },
                    })
                  }
                >
                  <TD>
                    <div className="font-medium text-foreground">{user.email}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {user.userId}
                    </div>
                  </TD>
                  <TD>{tierBadge(user.tier)}</TD>
                  <TD className="text-right tabular-nums">{user.credits}</TD>
                  <TD className="text-right tabular-nums text-muted-foreground">
                    {user.remainingToday}
                  </TD>
                  <TD className="text-muted-foreground">{user.locale}</TD>
                  <TD className="text-right text-muted-foreground">
                    {timeAgo(user.lastActiveAt)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </DataTable>
        )}

        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </Panel>
    </div>
  );
}
