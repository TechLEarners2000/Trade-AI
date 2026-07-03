import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Users, Newspaper, Bell, BookOpen, BarChart3, Activity, Settings } from 'lucide-react'

export default function Admin() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <Badge>Admin</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '1,234', change: '+12%', icon: Users, color: 'text-blue-500' },
          { label: 'Active Today', value: '456', change: '+5%', icon: Activity, color: 'text-green-500' },
          { label: 'Total Scans', value: '12,890', change: '+23%', icon: BarChart3, color: 'text-purple-500' },
          { label: 'Alerts Active', value: '567', change: '+8%', icon: Bell, color: 'text-yellow-500' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-green-500">{s.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-4 h-4" /> User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { name: 'John Doe', email: 'john@example.com', status: 'Active', plan: 'Free' },
                { name: 'Jane Smith', email: 'jane@example.com', status: 'Active', plan: 'Premium' },
                { name: 'Bob Wilson', email: 'bob@example.com', status: 'Inactive', plan: 'Free' },
              ].map((u) => (
                <div key={u.email} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <div className="text-sm font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.status === 'Active' ? 'success' : 'secondary'} className="text-xs">{u.status}</Badge>
                    <Badge variant="outline" className="text-xs">{u.plan}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-4 h-4" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Manage Learning Content', icon: BookOpen },
              { label: 'Add News Article', icon: Newspaper },
              { label: 'View System Logs', icon: Activity },
              { label: 'Analytics Dashboard', icon: BarChart3 },
            ].map((action) => (
              <Button key={action.label} variant="outline" className="w-full justify-start">
                <action.icon className="w-4 h-4 mr-2" /> {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
