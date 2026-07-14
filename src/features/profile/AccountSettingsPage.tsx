import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth.store'
import { apiClient } from '@/services/api/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PhoneInput } from '@/components/ui/PhoneInput'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export default function AccountSettingsPage() {
  const user = useAuthStore((s) => s.user)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  })

  async function onProfileSubmit(values: ProfileFormValues) {
    try {
      const { data } = await apiClient.patch('/users/me', values)
      // Keep the persisted auth store in sync with the server
      useAuthStore.setState((s) => ({ user: s.user ? { ...s.user, ...data } : s.user }))
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    }
  }

  async function onPasswordSubmit(values: PasswordFormValues) {
    try {
      await apiClient.post('/users/me/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success('Password changed successfully')
      passwordForm.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change password')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
      {/* Profile Settings */}
      <Card className="p-4 md:p-6">
        <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="mt-4 space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              placeholder="Your name"
              error={profileForm.formState.errors.name?.message}
              {...profileForm.register('name')}
            />
            <PhoneInput
              label="Phone Number"
              placeholder="10-digit phone"
              error={profileForm.formState.errors.phone?.message}
              {...profileForm.register('phone')}
            />
          </div>
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            error={profileForm.formState.errors.email?.message}
            {...profileForm.register('email')}
          />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={profileForm.formState.isSubmitting}
          >
            Save Changes
          </Button>
        </form>
      </Card>

      {/* Change Password */}
      <Card className="p-4 md:p-6">
        <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="mt-4 space-y-4" noValidate>
          <Input
            label="Current Password"
            type={showCurrentPassword ? 'text' : 'password'}
            placeholder="••••••••"
            rightSlot={
              <button
                type="button"
                onClick={() => setShowCurrentPassword((v) => !v)}
                className="flex size-10 -mr-1 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register('currentPassword')}
          />
          <Input
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            placeholder="••••••••"
            rightSlot={
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="flex size-10 -mr-1 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register('newPassword')}
          />
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            rightSlot={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="flex size-10 -mr-1 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register('confirmPassword')}
          />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={passwordForm.formState.isSubmitting}
          >
            Change Password
          </Button>
        </form>
      </Card>
      </div>
    </div>
  )
}
