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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          asset_tag: string | null
          assigned_to: string | null
          category: string | null
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          location_id: string | null
          manufacturer: string | null
          model: string | null
          name: string
          next_service_date: string | null
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          serial_number: string | null
          status: string
          updated_at: string
          warranty_expires: string | null
        }
        Insert: {
          asset_tag?: string | null
          assigned_to?: string | null
          category?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          location_id?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          next_service_date?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          status?: string
          updated_at?: string
          warranty_expires?: string | null
        }
        Update: {
          asset_tag?: string | null
          assigned_to?: string | null
          category?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          location_id?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          next_service_date?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          status?: string
          updated_at?: string
          warranty_expires?: string | null
        }
        Relationships: []
      }
      business_locations: {
        Row: {
          address: string | null
          city: string | null
          company_id: string
          country: string | null
          created_at: string
          created_by: string | null
          id: string
          manager_id: string | null
          name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          region: string | null
          status: string
          timezone: string | null
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_id: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          manager_id?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          region?: string | null
          status?: string
          timezone?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_id?: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          region?: string | null
          status?: string
          timezone?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      commercial_accounts: {
        Row: {
          account_manager_id: string | null
          account_name: string
          company_id: string
          contract_end: string | null
          contract_start: string | null
          contract_value: number
          created_at: string
          created_by: string | null
          credit_limit: number
          customer_id: string | null
          email: string | null
          id: string
          industry: string | null
          notes: string | null
          payment_terms: string | null
          phone: string | null
          primary_contact: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_manager_id?: string | null
          account_name: string
          company_id: string
          contract_end?: string | null
          contract_start?: string | null
          contract_value?: number
          created_at?: string
          created_by?: string | null
          credit_limit?: number
          customer_id?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          primary_contact?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_manager_id?: string | null
          account_name?: string
          company_id?: string
          contract_end?: string | null
          contract_start?: string | null
          contract_value?: number
          created_at?: string
          created_by?: string | null
          credit_limit?: number
          customer_id?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          primary_contact?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          plan: string | null
          postal_code: string | null
          region: string | null
          slug: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          plan?: string | null
          postal_code?: string | null
          region?: string | null
          slug?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          plan?: string | null
          postal_code?: string | null
          region?: string | null
          slug?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          address: string | null
          city: string | null
          company_id: string
          company_name: string
          country: string | null
          created_at: string
          created_by: string | null
          default_payment_terms: string | null
          email: string | null
          estimate_prefix: string
          id: string
          invoice_prefix: string
          logo_url: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          region: string | null
          tax_rate: number
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_id: string
          company_name?: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          default_payment_terms?: string | null
          email?: string | null
          estimate_prefix?: string
          id?: string
          invoice_prefix?: string
          logo_url?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          region?: string | null
          tax_rate?: number
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_id?: string
          company_name?: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          default_payment_terms?: string | null
          email?: string | null
          estimate_prefix?: string
          id?: string
          invoice_prefix?: string
          logo_url?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          region?: string | null
          tax_rate?: number
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      customer_communications: {
        Row: {
          body: string | null
          channel: string
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string
          direction: string
          id: string
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          channel?: string
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          direction?: string
          id?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          channel?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          direction?: string
          id?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customer_photos: {
        Row: {
          caption: string | null
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          status: string
          updated_at: string
          url: string
        }
        Insert: {
          caption?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          status?: string
          updated_at?: string
          url: string
        }
        Update: {
          caption?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          status?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          billing_address: string | null
          company_id: string
          contact_name: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          lifetime_value: number
          name: string
          notes: string | null
          phone: string | null
          service_address: string | null
          status: Database["public"]["Enums"]["customer_status"]
          tags: string[]
          type: Database["public"]["Enums"]["customer_type"]
          updated_at: string
        }
        Insert: {
          billing_address?: string | null
          company_id: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          lifetime_value?: number
          name: string
          notes?: string | null
          phone?: string | null
          service_address?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          tags?: string[]
          type?: Database["public"]["Enums"]["customer_type"]
          updated_at?: string
        }
        Update: {
          billing_address?: string | null
          company_id?: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          lifetime_value?: number
          name?: string
          notes?: string | null
          phone?: string | null
          service_address?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          tags?: string[]
          type?: Database["public"]["Enums"]["customer_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_assignments: {
        Row: {
          assigned_at: string
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          job_id: string
          notes: string | null
          scheduled_event_id: string | null
          status: string
          technician_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          job_id: string
          notes?: string | null
          scheduled_event_id?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          scheduled_event_id?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          document_type: string
          estimate_id: string | null
          id: string
          invoice_id: string | null
          job_id: string | null
          name: string
          notes: string | null
          property_id: string | null
          status: string
          updated_at: string
          url: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          document_type?: string
          estimate_id?: string | null
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          name: string
          notes?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          document_type?: string
          estimate_id?: string | null
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          name?: string
          notes?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          brand: string | null
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          id: string
          installed_on: string | null
          last_service_at: string | null
          model: string | null
          next_service_due: string | null
          notes: string | null
          property_id: string
          refrigerant_type: string | null
          seer_rating: number | null
          serial_number: string | null
          status: Database["public"]["Enums"]["equipment_status"]
          tonnage: number | null
          type: string
          updated_at: string
          warranty_expires: string | null
        }
        Insert: {
          brand?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          installed_on?: string | null
          last_service_at?: string | null
          model?: string | null
          next_service_due?: string | null
          notes?: string | null
          property_id: string
          refrigerant_type?: string | null
          seer_rating?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["equipment_status"]
          tonnage?: number | null
          type: string
          updated_at?: string
          warranty_expires?: string | null
        }
        Update: {
          brand?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          installed_on?: string | null
          last_service_at?: string | null
          model?: string | null
          next_service_due?: string | null
          notes?: string | null
          property_id?: string
          refrigerant_type?: string | null
          seer_rating?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["equipment_status"]
          tonnage?: number | null
          type?: string
          updated_at?: string
          warranty_expires?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_photos: {
        Row: {
          caption: string | null
          company_id: string
          created_at: string
          created_by: string | null
          equipment_id: string
          id: string
          status: string
          updated_at: string
          url: string
        }
        Insert: {
          caption?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          equipment_id: string
          id?: string
          status?: string
          updated_at?: string
          url: string
        }
        Update: {
          caption?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          equipment_id?: string
          id?: string
          status?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      estimate_line_items: {
        Row: {
          company_id: string
          created_at: string
          description: string
          estimate_id: string
          id: string
          item_id: string | null
          option_id: string | null
          quantity: number
          sort_order: number
          status: string
          total: number
          type: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          estimate_id: string
          id?: string
          item_id?: string | null
          option_id?: string | null
          quantity?: number
          sort_order?: number
          status?: string
          total?: number
          type?: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          estimate_id?: string
          id?: string
          item_id?: string | null
          option_id?: string | null
          quantity?: number
          sort_order?: number
          status?: string
          total?: number
          type?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      estimate_options: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          description: string | null
          efficiency_rating: string | null
          estimate_id: string
          highlights: string[] | null
          id: string
          is_recommended: boolean
          is_selected: boolean
          monthly_payment: number | null
          name: string
          sort_order: number
          status: string
          tier: string | null
          updated_at: string
          warranty_years: number | null
        }
        Insert: {
          amount?: number
          company_id: string
          created_at?: string
          description?: string | null
          efficiency_rating?: string | null
          estimate_id: string
          highlights?: string[] | null
          id?: string
          is_recommended?: boolean
          is_selected?: boolean
          monthly_payment?: number | null
          name: string
          sort_order?: number
          status?: string
          tier?: string | null
          updated_at?: string
          warranty_years?: number | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          description?: string | null
          efficiency_rating?: string | null
          estimate_id?: string
          highlights?: string[] | null
          id?: string
          is_recommended?: boolean
          is_selected?: boolean
          monthly_payment?: number | null
          name?: string
          sort_order?: number
          status?: string
          tier?: string | null
          updated_at?: string
          warranty_years?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estimate_options_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_options_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_photos: {
        Row: {
          caption: string | null
          company_id: string
          created_at: string
          created_by: string | null
          estimate_id: string
          id: string
          status: string
          updated_at: string
          url: string
        }
        Insert: {
          caption?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          estimate_id: string
          id?: string
          status?: string
          updated_at?: string
          url: string
        }
        Update: {
          caption?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          estimate_id?: string
          id?: string
          status?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      estimates: {
        Row: {
          approved_at: string | null
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string
          equipment_id: string | null
          estimate_number: string
          expires_at: string | null
          id: string
          job_id: string | null
          notes: string | null
          property_id: string | null
          signature_data: string | null
          signed_at: string | null
          signed_by_name: string | null
          status: Database["public"]["Enums"]["estimate_status"]
          subtotal: number
          tax: number
          title: string
          total: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          equipment_id?: string | null
          estimate_number: string
          expires_at?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          property_id?: string | null
          signature_data?: string | null
          signed_at?: string | null
          signed_by_name?: string | null
          status?: Database["public"]["Enums"]["estimate_status"]
          subtotal?: number
          tax?: number
          title: string
          total?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          equipment_id?: string | null
          estimate_number?: string
          expires_at?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          property_id?: string | null
          signature_data?: string | null
          signed_at?: string | null
          signed_by_name?: string | null
          status?: Database["public"]["Enums"]["estimate_status"]
          subtotal?: number
          tax?: number
          title?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      installations: {
        Row: {
          brand: string | null
          company_id: string
          completed_date: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          equipment_type: string | null
          id: string
          install_number: string
          model: string | null
          notes: string | null
          permit_number: string | null
          property_id: string | null
          scheduled_date: string | null
          serial_number: string | null
          status: string
          technician_id: string | null
          total_value: number
          updated_at: string
          warranty_years: number | null
        }
        Insert: {
          brand?: string | null
          company_id: string
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          equipment_type?: string | null
          id?: string
          install_number: string
          model?: string | null
          notes?: string | null
          permit_number?: string | null
          property_id?: string | null
          scheduled_date?: string | null
          serial_number?: string | null
          status?: string
          technician_id?: string | null
          total_value?: number
          updated_at?: string
          warranty_years?: number | null
        }
        Update: {
          brand?: string | null
          company_id?: string
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          equipment_type?: string | null
          id?: string
          install_number?: string
          model?: string | null
          notes?: string | null
          permit_number?: string | null
          property_id?: string | null
          scheduled_date?: string | null
          serial_number?: string | null
          status?: string
          technician_id?: string | null
          total_value?: number
          updated_at?: string
          warranty_years?: number | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          barcode: string | null
          category: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          min_stock_level: number
          name: string
          reorder_point: number
          sku: string
          status: string
          track_serial: boolean
          unit: string | null
          unit_cost: number
          unit_price: number
          updated_at: string
          vendor_email: string | null
          vendor_name: string | null
          vendor_phone: string | null
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          min_stock_level?: number
          name: string
          reorder_point?: number
          sku: string
          status?: string
          track_serial?: boolean
          unit?: string | null
          unit_cost?: number
          unit_price?: number
          updated_at?: string
          vendor_email?: string | null
          vendor_name?: string | null
          vendor_phone?: string | null
        }
        Update: {
          barcode?: string | null
          category?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          min_stock_level?: number
          name?: string
          reorder_point?: number
          sku?: string
          status?: string
          track_serial?: boolean
          unit?: string | null
          unit_cost?: number
          unit_price?: number
          updated_at?: string
          vendor_email?: string | null
          vendor_name?: string | null
          vendor_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_locations: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
          status: string
          type: Database["public"]["Enums"]["location_type"]
          updated_at: string
          van_id: string | null
          warehouse_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
          status?: string
          type?: Database["public"]["Enums"]["location_type"]
          updated_at?: string
          van_id?: string | null
          warehouse_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          status?: string
          type?: Database["public"]["Enums"]["location_type"]
          updated_at?: string
          van_id?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_locations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_locations_van_id_fkey"
            columns: ["van_id"]
            isOneToOne: false
            referencedRelation: "vans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_locations_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_stock: {
        Row: {
          company_id: string
          created_at: string
          id: string
          item_id: string
          location_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          item_id: string
          location_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          item_id?: string
          location_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_stock_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          from_location_id: string | null
          id: string
          item_id: string
          job_id: string | null
          notes: string | null
          quantity: number
          reference: string | null
          status: string
          to_location_id: string | null
          type: Database["public"]["Enums"]["inv_txn_type"]
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          from_location_id?: string | null
          id?: string
          item_id: string
          job_id?: string | null
          notes?: string | null
          quantity: number
          reference?: string | null
          status?: string
          to_location_id?: string | null
          type: Database["public"]["Enums"]["inv_txn_type"]
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          from_location_id?: string | null
          id?: string
          item_id?: string
          job_id?: string | null
          notes?: string | null
          quantity?: number
          reference?: string | null
          status?: string
          to_location_id?: string | null
          type?: Database["public"]["Enums"]["inv_txn_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_job_fk"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          invoice_id: string
          item_id: string | null
          quantity: number
          sort_order: number
          status: string
          total: number
          type: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          item_id?: string | null
          quantity?: number
          sort_order?: number
          status?: string
          total?: number
          type?: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          item_id?: string | null
          quantity?: number
          sort_order?: number
          status?: string
          total?: number
          type?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_paid: number
          balance_due: number
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string
          due_at: string | null
          estimate_id: string | null
          id: string
          invoice_number: string
          issued_at: string
          job_id: string | null
          notes: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          balance_due?: number
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          due_at?: string | null
          estimate_id?: string | null
          id?: string
          invoice_number: string
          issued_at?: string
          job_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          balance_due?: number
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          due_at?: string | null
          estimate_id?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string
          job_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_photos: {
        Row: {
          caption: string | null
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          job_id: string
          status: string
          taken_at: string | null
          updated_at: string
          url: string
        }
        Insert: {
          caption?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          job_id: string
          status?: string
          taken_at?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          caption?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          job_id?: string
          status?: string
          taken_at?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string
          description: string | null
          duration_minutes: number | null
          equipment_id: string | null
          eta_minutes: number | null
          id: string
          is_emergency: boolean
          job_number: string
          priority: Database["public"]["Enums"]["job_priority"]
          property_id: string | null
          recurrence: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          service_address: string | null
          status: Database["public"]["Enums"]["job_status"]
          technician_id: string | null
          title: string
          total_value: number
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          description?: string | null
          duration_minutes?: number | null
          equipment_id?: string | null
          eta_minutes?: number | null
          id?: string
          is_emergency?: boolean
          job_number: string
          priority?: Database["public"]["Enums"]["job_priority"]
          property_id?: string | null
          recurrence?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          service_address?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          technician_id?: string | null
          title: string
          total_value?: number
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          description?: string | null
          duration_minutes?: number | null
          equipment_id?: string | null
          eta_minutes?: number | null
          id?: string
          is_emergency?: boolean
          job_number?: string
          priority?: Database["public"]["Enums"]["job_priority"]
          property_id?: string | null
          recurrence?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          service_address?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          technician_id?: string | null
          title?: string
          total_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_agreements: {
        Row: {
          annual_price: number
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string
          end_date: string | null
          frequency: string
          id: string
          name: string
          next_visit: string | null
          property_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["agreement_status"]
          updated_at: string
          visits_per_year: number
        }
        Insert: {
          annual_price?: number
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          end_date?: string | null
          frequency?: string
          id?: string
          name: string
          next_visit?: string | null
          property_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["agreement_status"]
          updated_at?: string
          visits_per_year?: number
        }
        Update: {
          annual_price?: number
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          end_date?: string | null
          frequency?: string
          id?: string
          name?: string
          next_visit?: string | null
          property_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["agreement_status"]
          updated_at?: string
          visits_per_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_agreements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_agreements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_agreements_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string
          end_date: string | null
          frequency: string
          id: string
          name: string
          next_visit: string | null
          notes: string | null
          plan_name: string | null
          price: number
          property_id: string | null
          start_date: string
          status: string
          updated_at: string
          visits_per_year: number
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          end_date?: string | null
          frequency?: string
          id?: string
          name: string
          next_visit?: string | null
          notes?: string | null
          plan_name?: string | null
          price?: number
          property_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          visits_per_year?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          end_date?: string | null
          frequency?: string
          id?: string
          name?: string
          next_visit?: string | null
          notes?: string | null
          plan_name?: string | null
          price?: number
          property_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          visits_per_year?: number
        }
        Relationships: []
      }
      module_records: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          data: Json
          id: string
          module_key: string
          notes: string | null
          status: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          module_key: string
          notes?: string | null
          status?: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          module_key?: string
          notes?: string | null
          status?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          company_id: string
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          status: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          company_id: string
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          status?: string
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          company_id?: string
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          status?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          invoice_id: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string
          reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          invoice_id: string
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          invoice_id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_schedules: {
        Row: {
          agreement_id: string | null
          assigned_tech_id: string | null
          checklist: string | null
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          equipment_id: string | null
          frequency: string
          id: string
          last_visit: string | null
          name: string
          next_visit: string | null
          notes: string | null
          property_id: string | null
          status: string
          updated_at: string
          visits_per_year: number
        }
        Insert: {
          agreement_id?: string | null
          assigned_tech_id?: string | null
          checklist?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          equipment_id?: string | null
          frequency?: string
          id?: string
          last_visit?: string | null
          name: string
          next_visit?: string | null
          notes?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
          visits_per_year?: number
        }
        Update: {
          agreement_id?: string | null
          assigned_tech_id?: string | null
          checklist?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          equipment_id?: string | null
          frequency?: string
          id?: string
          last_visit?: string | null
          name?: string
          next_visit?: string | null
          notes?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
          visits_per_year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_cost: number
          budget: number
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          notes: string | null
          project_manager_id: string | null
          property_id: string | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          actual_cost?: number
          budget?: number
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          notes?: string | null
          project_manager_id?: string | null
          property_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          actual_cost?: number
          budget?: number
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          project_manager_id?: string | null
          property_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          access_notes: string | null
          address: string
          city: string | null
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string
          gate_code: string | null
          id: string
          name: string | null
          notes: string | null
          pets: string | null
          postal_code: string | null
          preferred_appointment_times: string | null
          region: string | null
          square_feet: number | null
          status: string
          system_count: number
          type: Database["public"]["Enums"]["property_type"]
          units: number | null
          updated_at: string
        }
        Insert: {
          access_notes?: string | null
          address: string
          city?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          gate_code?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          pets?: string | null
          postal_code?: string | null
          preferred_appointment_times?: string | null
          region?: string | null
          square_feet?: number | null
          status?: string
          system_count?: number
          type?: Database["public"]["Enums"]["property_type"]
          units?: number | null
          updated_at?: string
        }
        Update: {
          access_notes?: string | null
          address?: string
          city?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          gate_code?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          pets?: string | null
          postal_code?: string | null
          preferred_appointment_times?: string | null
          region?: string | null
          square_feet?: number | null
          status?: string
          system_count?: number
          type?: Database["public"]["Enums"]["property_type"]
          units?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          item_id: string | null
          purchase_order_id: string
          quantity: number
          received_qty: number
          status: string
          total: number
          unit_cost: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          id?: string
          item_id?: string | null
          purchase_order_id: string
          quantity?: number
          received_qty?: number
          status?: string
          total?: number
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          item_id?: string | null
          purchase_order_id?: string
          quantity?: number
          received_qty?: number
          status?: string
          total?: number
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          expected_at: string | null
          id: string
          notes: string | null
          po_number: string
          received_at: string | null
          status: Database["public"]["Enums"]["po_status"]
          subtotal: number
          tax: number
          total: number
          updated_at: string
          vendor_email: string | null
          vendor_name: string
          warehouse_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          expected_at?: string | null
          id?: string
          notes?: string | null
          po_number: string
          received_at?: string | null
          status?: Database["public"]["Enums"]["po_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          vendor_email?: string | null
          vendor_name: string
          warehouse_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          expected_at?: string | null
          id?: string
          notes?: string | null
          po_number?: string
          received_at?: string | null
          status?: Database["public"]["Enums"]["po_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          vendor_email?: string | null
          vendor_name?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          id: string
          job_id: string | null
          rating: number
          source: string | null
          status: string
          technician_id: string | null
          updated_at: string
        }
        Insert: {
          comment?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          job_id?: string | null
          rating: number
          source?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string
        }
        Update: {
          comment?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          job_id?: string | null
          rating?: number
          source?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_opportunities: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          expected_close: string | null
          id: string
          name: string
          notes: string | null
          owner_id: string | null
          probability: number
          stage: Database["public"]["Enums"]["opportunity_stage"]
          status: string
          updated_at: string
          value: number
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          expected_close?: string | null
          id?: string
          name: string
          notes?: string | null
          owner_id?: string | null
          probability?: number
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          status?: string
          updated_at?: string
          value?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          expected_close?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner_id?: string | null
          probability?: number
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          status?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_opportunities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_events: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          ends_at: string | null
          id: string
          job_id: string | null
          property_id: string | null
          starts_at: string
          status: string
          technician_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          job_id?: string | null
          property_id?: string | null
          starts_at: string
          status?: string
          technician_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          job_id?: string | null
          property_id?: string | null
          starts_at?: string
          status?: string
          technician_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_tickets: {
        Row: {
          assigned_to: string | null
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string
          description: string | null
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          property_id: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          ticket_number: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          property_id?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          ticket_number: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          property_id?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          ticket_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tickets_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      slas: {
        Row: {
          commercial_account_id: string | null
          company_id: string
          coverage_window: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          effective_date: string | null
          expiration_date: string | null
          id: string
          name: string
          notes: string | null
          penalty_amount: number
          priority: string
          resolution_time_hours: number
          response_time_hours: number
          status: string
          updated_at: string
        }
        Insert: {
          commercial_account_id?: string | null
          company_id: string
          coverage_window?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          name: string
          notes?: string | null
          penalty_amount?: number
          priority?: string
          resolution_time_hours?: number
          response_time_hours?: number
          status?: string
          updated_at?: string
        }
        Update: {
          commercial_account_id?: string | null
          company_id?: string
          coverage_window?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          penalty_amount?: number
          priority?: string
          resolution_time_hours?: number
          response_time_hours?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      technicians: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string
          hourly_cost: number | null
          hourly_rate: number | null
          id: string
          phone: string | null
          role_title: string | null
          skills: string[] | null
          status: Database["public"]["Enums"]["tech_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name: string
          hourly_cost?: number | null
          hourly_rate?: number | null
          id?: string
          phone?: string | null
          role_title?: string | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["tech_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name?: string
          hourly_cost?: number | null
          hourly_rate?: number | null
          id?: string
          phone?: string | null
          role_title?: string | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["tech_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technicians_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          approved: boolean
          approved_by: string | null
          billable: boolean
          clock_in: string | null
          clock_out: string | null
          company_id: string
          created_at: string
          created_by: string | null
          entry_date: string
          entry_type: string
          hours: number
          id: string
          job_id: string | null
          notes: string | null
          status: string
          technician_id: string | null
          updated_at: string
        }
        Insert: {
          approved?: boolean
          approved_by?: string | null
          billable?: boolean
          clock_in?: string | null
          clock_out?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          entry_date?: string
          entry_type?: string
          hours?: number
          id?: string
          job_id?: string | null
          notes?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string
        }
        Update: {
          approved?: boolean
          approved_by?: string | null
          billable?: boolean
          clock_in?: string | null
          clock_out?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          entry_date?: string
          entry_type?: string
          hours?: number
          id?: string
          job_id?: string | null
          notes?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vans: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          license_plate: string | null
          make: string | null
          model: string | null
          name: string
          status: string
          technician_id: string | null
          updated_at: string
          year: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          license_plate?: string | null
          make?: string | null
          model?: string | null
          name: string
          status?: string
          technician_id?: string | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          license_plate?: string | null
          make?: string | null
          model?: string | null
          name?: string
          status?: string
          technician_id?: string | null
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vans_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          category: string | null
          company_id: string
          contact_name: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          lead_time_days: number | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          company_id: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          lead_time_days?: number | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          company_id?: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          lead_time_days?: number | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          address: string | null
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_user_workspace: { Args: never; Returns: string }
      get_my_company_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_admin: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      agreement_status: "draft" | "active" | "paused" | "expired" | "cancelled"
      app_role:
        | "owner"
        | "admin"
        | "dispatcher"
        | "technician"
        | "accountant"
        | "sales_rep"
        | "office_staff"
        | "warehouse_manager"
      customer_status: "lead" | "active" | "inactive" | "archived"
      customer_type: "residential" | "commercial"
      equipment_status:
        | "operational"
        | "needs_service"
        | "out_of_service"
        | "decommissioned"
      estimate_status:
        | "draft"
        | "sent"
        | "approved"
        | "rejected"
        | "expired"
        | "converted"
      inv_txn_type: "receipt" | "issue" | "transfer" | "adjustment" | "return"
      invoice_status: "draft" | "sent" | "partial" | "paid" | "overdue" | "void"
      job_priority: "low" | "medium" | "high" | "urgent"
      job_status:
        | "scheduled"
        | "dispatched"
        | "in_progress"
        | "on_hold"
        | "completed"
        | "cancelled"
        | "unassigned"
        | "on_the_way"
        | "arrived"
        | "invoiced"
        | "paid"
      location_type: "warehouse" | "van" | "other"
      notification_type:
        | "job"
        | "invoice"
        | "ticket"
        | "payment"
        | "inventory"
        | "system"
      opportunity_stage:
        | "new_lead"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "won"
        | "lost"
      payment_method: "cash" | "check" | "card" | "ach" | "other"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      po_status: "draft" | "sent" | "partial" | "received" | "cancelled"
      property_type:
        | "single_family"
        | "multi_family"
        | "office"
        | "retail"
        | "industrial"
        | "education"
        | "healthcare"
        | "other"
      tech_status: "available" | "on_job" | "driving" | "off" | "unavailable"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status: "open" | "in_progress" | "waiting" | "resolved" | "closed"
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
      agreement_status: ["draft", "active", "paused", "expired", "cancelled"],
      app_role: [
        "owner",
        "admin",
        "dispatcher",
        "technician",
        "accountant",
        "sales_rep",
        "office_staff",
        "warehouse_manager",
      ],
      customer_status: ["lead", "active", "inactive", "archived"],
      customer_type: ["residential", "commercial"],
      equipment_status: [
        "operational",
        "needs_service",
        "out_of_service",
        "decommissioned",
      ],
      estimate_status: [
        "draft",
        "sent",
        "approved",
        "rejected",
        "expired",
        "converted",
      ],
      inv_txn_type: ["receipt", "issue", "transfer", "adjustment", "return"],
      invoice_status: ["draft", "sent", "partial", "paid", "overdue", "void"],
      job_priority: ["low", "medium", "high", "urgent"],
      job_status: [
        "scheduled",
        "dispatched",
        "in_progress",
        "on_hold",
        "completed",
        "cancelled",
        "unassigned",
        "on_the_way",
        "arrived",
        "invoiced",
        "paid",
      ],
      location_type: ["warehouse", "van", "other"],
      notification_type: [
        "job",
        "invoice",
        "ticket",
        "payment",
        "inventory",
        "system",
      ],
      opportunity_stage: [
        "new_lead",
        "qualified",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ],
      payment_method: ["cash", "check", "card", "ach", "other"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      po_status: ["draft", "sent", "partial", "received", "cancelled"],
      property_type: [
        "single_family",
        "multi_family",
        "office",
        "retail",
        "industrial",
        "education",
        "healthcare",
        "other",
      ],
      tech_status: ["available", "on_job", "driving", "off", "unavailable"],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: ["open", "in_progress", "waiting", "resolved", "closed"],
    },
  },
} as const
