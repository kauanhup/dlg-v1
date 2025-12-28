export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bot_activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          device_id: string | null
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          device_id?: string | null
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          device_id?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bot_device_sessions: {
        Row: {
          created_at: string
          device_id: string
          device_name: string | null
          device_os: string | null
          id: string
          ip_address: string | null
          is_active: boolean
          last_activity_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_id: string
          device_name?: string | null
          device_os?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_activity_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_id?: string
          device_name?: string | null
          device_os?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_activity_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bot_files: {
        Row: {
          file_name: string
          file_path: string
          file_size: number
          id: string
          is_active: boolean
          updated_at: string
          uploaded_at: string
          version: string
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number
          id?: string
          is_active?: boolean
          updated_at?: string
          uploaded_at?: string
          version?: string
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          is_active?: boolean
          updated_at?: string
          uploaded_at?: string
          version?: string
        }
        Relationships: []
      }
      gateway_logs: {
        Row: {
          attempt: number | null
          created_at: string | null
          error: string | null
          gateway: string
          id: string
          order_id: string | null
          status: string
        }
        Insert: {
          attempt?: number | null
          created_at?: string | null
          error?: string | null
          gateway: string
          id?: string
          order_id?: string | null
          status: string
        }
        Update: {
          attempt?: number | null
          created_at?: string | null
          error?: string | null
          gateway?: string
          id?: string
          order_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "gateway_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "health_pending_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gateway_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      gateway_settings: {
        Row: {
          client_id: string | null
          client_secret: string | null
          created_at: string
          email_enabled: boolean | null
          email_template_accent_color: string | null
          email_template_bg_color: string | null
          email_template_expiry_text: string | null
          email_template_footer: string | null
          email_template_greeting: string | null
          email_template_logo_url: string | null
          email_template_message: string | null
          email_template_show_logo: boolean | null
          email_template_title: string | null
          email_verification_enabled: boolean | null
          evopay_api_key: string | null
          evopay_enabled: boolean | null
          evopay_webhook_url: string | null
          evopay_weight: number | null
          id: string
          is_active: boolean
          mercadopago_access_token: string | null
          mercadopago_enabled: boolean | null
          mercadopago_public_key: string | null
          password_recovery_enabled: boolean | null
          pixup_weight: number | null
          provider: string
          recaptcha_enabled: boolean | null
          recaptcha_secret_key: string | null
          recaptcha_site_key: string | null
          resend_api_key: string | null
          resend_from_email: string | null
          resend_from_name: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          email_enabled?: boolean | null
          email_template_accent_color?: string | null
          email_template_bg_color?: string | null
          email_template_expiry_text?: string | null
          email_template_footer?: string | null
          email_template_greeting?: string | null
          email_template_logo_url?: string | null
          email_template_message?: string | null
          email_template_show_logo?: boolean | null
          email_template_title?: string | null
          email_verification_enabled?: boolean | null
          evopay_api_key?: string | null
          evopay_enabled?: boolean | null
          evopay_webhook_url?: string | null
          evopay_weight?: number | null
          id?: string
          is_active?: boolean
          mercadopago_access_token?: string | null
          mercadopago_enabled?: boolean | null
          mercadopago_public_key?: string | null
          password_recovery_enabled?: boolean | null
          pixup_weight?: number | null
          provider?: string
          recaptcha_enabled?: boolean | null
          recaptcha_secret_key?: string | null
          recaptcha_site_key?: string | null
          resend_api_key?: string | null
          resend_from_email?: string | null
          resend_from_name?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          email_enabled?: boolean | null
          email_template_accent_color?: string | null
          email_template_bg_color?: string | null
          email_template_expiry_text?: string | null
          email_template_footer?: string | null
          email_template_greeting?: string | null
          email_template_logo_url?: string | null
          email_template_message?: string | null
          email_template_show_logo?: boolean | null
          email_template_title?: string | null
          email_verification_enabled?: boolean | null
          evopay_api_key?: string | null
          evopay_enabled?: boolean | null
          evopay_webhook_url?: string | null
          evopay_weight?: number | null
          id?: string
          is_active?: boolean
          mercadopago_access_token?: string | null
          mercadopago_enabled?: boolean | null
          mercadopago_public_key?: string | null
          password_recovery_enabled?: boolean | null
          pixup_weight?: number | null
          provider?: string
          recaptcha_enabled?: boolean | null
          recaptcha_secret_key?: string | null
          recaptcha_site_key?: string | null
          resend_api_key?: string | null
          resend_from_email?: string | null
          resend_from_name?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      ip_login_attempts: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
      licenses: {
        Row: {
          auto_renew: boolean
          created_at: string
          end_date: string
          id: string
          plan_name: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean
          created_at?: string
          end_date: string
          id?: string
          plan_name?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean
          created_at?: string
          end_date?: string
          id?: string
          plan_name?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      login_history: {
        Row: {
          created_at: string
          device: string | null
          failure_reason: string | null
          id: string
          ip_address: string | null
          location: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_version: number | null
          payment_method: string | null
          plan_features_snapshot: Json | null
          plan_id_snapshot: string | null
          plan_period_days: number | null
          product_name: string
          product_type: string
          quantity: number
          status: string
          updated_at: string
          upgrade_credit_amount: number | null
          upgrade_from_subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_version?: number | null
          payment_method?: string | null
          plan_features_snapshot?: Json | null
          plan_id_snapshot?: string | null
          plan_period_days?: number | null
          product_name: string
          product_type: string
          quantity?: number
          status?: string
          updated_at?: string
          upgrade_credit_amount?: number | null
          upgrade_from_subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_version?: number | null
          payment_method?: string | null
          plan_features_snapshot?: Json | null
          plan_id_snapshot?: string | null
          plan_period_days?: number | null
          product_name?: string
          product_type?: string
          quantity?: number
          status?: string
          updated_at?: string
          upgrade_credit_amount?: number | null
          upgrade_from_subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_upgrade_from_subscription_id_fkey"
            columns: ["upgrade_from_subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          evopay_transaction_id: string | null
          id: string
          order_id: string | null
          paid_at: string | null
          payment_method: string
          pix_code: string | null
          qr_code_base64: string | null
          status: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          evopay_transaction_id?: string | null
          id?: string
          order_id?: string | null
          paid_at?: string | null
          payment_method?: string
          pix_code?: string | null
          qr_code_base64?: string | null
          status?: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          evopay_transaction_id?: string | null
          id?: string
          order_id?: string | null
          paid_at?: string | null
          payment_method?: string
          pix_code?: string | null
          qr_code_base64?: string | null
          status?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "health_pending_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_webhooks: {
        Row: {
          gateway: string
          id: string
          order_id: string | null
          processed_at: string | null
          transaction_id: string
          webhook_payload: Json | null
        }
        Insert: {
          gateway: string
          id?: string
          order_id?: string | null
          processed_at?: string | null
          transaction_id: string
          webhook_payload?: Json | null
        }
        Update: {
          gateway?: string
          id?: string
          order_id?: string | null
          processed_at?: string | null
          transaction_id?: string
          webhook_payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "processed_webhooks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "health_pending_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processed_webhooks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          ban_reason: string | null
          banned: boolean
          banned_at: string | null
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
          user_id: string
          whatsapp: string
        }
        Insert: {
          avatar?: string | null
          ban_reason?: string | null
          banned?: boolean
          banned_at?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
          whatsapp: string
        }
        Update: {
          avatar?: string | null
          ban_reason?: string | null
          banned?: boolean
          banned_at?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_address: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_address: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      reconciliation_runs: {
        Row: {
          categories: Json | null
          completed_at: string | null
          duration_ms: number | null
          error: string | null
          id: string
          started_at: string
          status: string | null
          total_corrected: number | null
          total_detected: number | null
          total_uncorrectable: number | null
        }
        Insert: {
          categories?: Json | null
          completed_at?: string | null
          duration_ms?: number | null
          error?: string | null
          id?: string
          started_at?: string
          status?: string | null
          total_corrected?: number | null
          total_detected?: number | null
          total_uncorrectable?: number | null
        }
        Update: {
          categories?: Json | null
          completed_at?: string | null
          duration_ms?: number | null
          error?: string | null
          id?: string
          started_at?: string
          status?: string | null
          total_corrected?: number | null
          total_detected?: number | null
          total_uncorrectable?: number | null
        }
        Relationships: []
      }
      session_combos: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_popular: boolean
          price: number
          quantity: number
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_popular?: boolean
          price: number
          quantity: number
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_popular?: boolean
          price?: number
          quantity?: number
          type?: string
        }
        Relationships: []
      }
      session_files: {
        Row: {
          file_name: string
          file_path: string
          id: string
          order_id: string | null
          reserved_at: string | null
          reserved_for_order: string | null
          sold_at: string | null
          status: string
          type: string
          uploaded_at: string
          user_id: string | null
        }
        Insert: {
          file_name: string
          file_path: string
          id?: string
          order_id?: string | null
          reserved_at?: string | null
          reserved_for_order?: string | null
          sold_at?: string | null
          status?: string
          type: string
          uploaded_at?: string
          user_id?: string | null
        }
        Update: {
          file_name?: string
          file_path?: string
          id?: string
          order_id?: string | null
          reserved_at?: string | null
          reserved_for_order?: string | null
          sold_at?: string | null
          status?: string
          type?: string
          uploaded_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_files_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "health_pending_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_files_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_files_reserved_for_order_fkey"
            columns: ["reserved_for_order"]
            isOneToOne: false
            referencedRelation: "health_pending_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_files_reserved_for_order_fkey"
            columns: ["reserved_for_order"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions_inventory: {
        Row: {
          cost_per_session: number
          custom_price_per_unit: number
          custom_quantity_enabled: boolean
          custom_quantity_min: number
          id: string
          quantity: number
          sale_price_per_session: number
          type: string
          updated_at: string
        }
        Insert: {
          cost_per_session?: number
          custom_price_per_unit?: number
          custom_quantity_enabled?: boolean
          custom_quantity_min?: number
          id?: string
          quantity?: number
          sale_price_per_session?: number
          type: string
          updated_at?: string
        }
        Update: {
          cost_per_session?: number
          custom_price_per_unit?: number
          custom_quantity_enabled?: boolean
          custom_quantity_min?: number
          id?: string
          quantity?: number
          sale_price_per_session?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          features: string[] | null
          id: string
          is_active: boolean
          max_devices: number | null
          max_subscriptions_per_user: number | null
          name: string
          period: number
          price: number
          promotional_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: string[] | null
          id?: string
          is_active?: boolean
          max_devices?: number | null
          max_subscriptions_per_user?: number | null
          name: string
          period: number
          price: number
          promotional_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: string[] | null
          id?: string
          is_active?: boolean
          max_devices?: number | null
          max_subscriptions_per_user?: number | null
          name?: string
          period?: number
          price?: number
          promotional_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          id: string
          is_downloaded: boolean
          order_id: string | null
          session_data: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_downloaded?: boolean
          order_id?: string | null
          session_data: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_downloaded?: boolean
          order_id?: string | null
          session_data?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_sessions_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "health_pending_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_sessions_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expiration_notified_at: string | null
          id: string
          next_billing_date: string | null
          plan_id: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expiration_notified_at?: string | null
          id?: string
          next_billing_date?: string | null
          plan_id: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expiration_notified_at?: string | null
          id?: string
          next_billing_date?: string | null
          plan_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string
          failed_attempts: number | null
          id: string
          type: string
          used: boolean | null
          user_email: string
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at: string
          failed_attempts?: number | null
          id?: string
          type: string
          used?: boolean | null
          user_email: string
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string
          failed_attempts?: number | null
          id?: string
          type?: string
          used?: boolean | null
          user_email?: string
        }
        Relationships: []
      }
    }
    Views: {
      health_dashboard_summary: {
        Row: {
          checked_at: string | null
          divergent_users: number | null
          licenses_should_expire: number | null
          orphaned_reservations: number | null
          payments_without_completion: number | null
          pending_orders_alert: number | null
          reconciliations_24h: number | null
        }
        Relationships: []
      }
      health_license_subscription_divergence: {
        Row: {
          active_licenses: number | null
          active_subscriptions: number | null
          status: string | null
          user_id: string | null
        }
        Relationships: []
      }
      health_licenses_should_expire: {
        Row: {
          end_date: string | null
          hours_overdue: number | null
          id: string | null
          plan_name: string | null
          user_id: string | null
        }
        Insert: {
          end_date?: string | null
          hours_overdue?: never
          id?: string | null
          plan_name?: string | null
          user_id?: string | null
        }
        Update: {
          end_date?: string | null
          hours_overdue?: never
          id?: string | null
          plan_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      health_orphaned_reservations: {
        Row: {
          file_name: string | null
          issue: string | null
          minutes_reserved: number | null
          order_status: string | null
          reserved_at: string | null
          reserved_for_order: string | null
          session_id: string | null
          type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_files_reserved_for_order_fkey"
            columns: ["reserved_for_order"]
            isOneToOne: false
            referencedRelation: "health_pending_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_files_reserved_for_order_fkey"
            columns: ["reserved_for_order"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      health_payments_without_completion: {
        Row: {
          amount: number | null
          minutes_since_payment: number | null
          order_id: string | null
          order_status: string | null
          paid_at: string | null
          payment_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "health_pending_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      health_pending_orders: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string | null
          minutes_pending: number | null
          product_name: string | null
          product_type: string | null
          severity: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string | null
          minutes_pending?: never
          product_name?: string | null
          product_type?: string | null
          severity?: never
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string | null
          minutes_pending?: never
          product_name?: string | null
          product_type?: string | null
          severity?: never
          user_id?: string | null
        }
        Relationships: []
      }
      health_recent_reconciliations: {
        Row: {
          action: string | null
          created_at: string | null
          details: Json | null
          resource: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          resource?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          resource?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      complete_order_atomic: {
        Args: {
          _order_id: string
          _product_type: string
          _quantity: number
          _user_id: string
        }
        Returns: Json
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      release_session_reservation: {
        Args: { p_order_id: string }
        Returns: Json
      }
      reserve_sessions_atomic: {
        Args: { p_order_id: string; p_quantity: number; p_session_type: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
      order_status:
        | "pending"
        | "completed"
        | "cancelled"
        | "expired"
        | "refunded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      order_status: [
        "pending",
        "completed",
        "cancelled",
        "expired",
        "refunded",
      ],
    },
  },
} as const
