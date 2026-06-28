"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { fetchJson } from "@/lib/fetch-json"
import Link from "next/link"
import { useEffect, useState } from "react"

type Contact = {
  id: string
  name: string
  username: string | null
  image: string | null
  location: string | null
  isVerified: boolean
}
export function ContactsWidget() {
  const [contacts, setContacts] = useState<Contact[]>([])
  useEffect(() => {
    function fetchContacts() {
      fetchJson<{ contacts: Contact[] }>("/api/friends/contacts")
        .then((d) => setContacts(d.contacts ?? []))
        .catch(() => {})
    }
    fetchContacts()
    const interval = setInterval(fetchContacts, 30_000)
    function onVisible() {
      if (document.visibilityState === "visible") fetchContacts()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])
  return (
    <GlassCard className="p-5">
      <h3 className="mb-4 font-semibold">Contacts</h3>
      {contacts.length === 0 ? (
        <p className="text-muted text-sm">Add friends to see them here</p>
      ) : (
        <div className="space-y-1">
          {contacts.map((c) => (
            <Link
              key={c.id}
              href={c.username ? `/u/${c.username}` : "#"}
              className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/5"
            >
              {c.image ? (
                <img
                  src={c.image}
                  alt=""
                  className="size-9 rounded-full object-cover ring-2 ring-white/10"
                />
              ) : (
                <div className="from-accent/30 to-accent-secondary/20 text-accent flex size-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold">
                  {c.name[0]}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{c.name}</p>
                {c.location && (
                  <p className="text-muted truncate text-xs">{c.location}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </GlassCard>
  )
}
