// Stub types — replace with openapi-typescript output once rswag is configured
export interface paths {
  "/contacts": {
    get: {
      parameters: {
        query: {
          q?: string;
          status?: string;
          tag_id?: string;
          sort?: string;
          direction?: string;
          page?: number;
          per_page?: number;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": {
              data: Record<string, unknown>[];
              meta: Record<string, unknown>;
            };
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            contact: Record<string, unknown>;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/contacts/{id}": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/companies": {
    get: {
      parameters: {
        query: {
          q?: string;
          sort?: string;
          direction?: string;
          page?: number;
          per_page?: number;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": {
              data: Record<string, unknown>[];
              meta: Record<string, unknown>;
            };
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            company: Record<string, unknown>;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/companies/{id}": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/deals": {
    get: {
      parameters: {
        query: {
          stage_id?: string;
          pipeline_id?: string;
          tag_id?: string;
          sort?: string;
          direction?: string;
          page?: number;
          per_page?: number;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": {
              data: Record<string, unknown>[];
              meta: Record<string, unknown>;
            };
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            deal: Record<string, unknown>;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/deals/{id}": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/deals/{id}/move": {
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            stage_id: string;
            position?: number;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/deals/{id}/summary": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": {
              summary?: string;
              stale?: boolean;
            };
          };
        };
      };
    };
  };
  "/pipelines": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": {
              data: Record<string, unknown>[];
              meta: Record<string, unknown>;
            };
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            pipeline: Record<string, unknown>;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/pipelines/{id}": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/pipelines/{pipeline_id}/stages": {
    get: {
      parameters: {
        path: {
          pipeline_id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>[];
          };
        };
      };
    };
    post: {
      parameters: {
        path: {
          pipeline_id: string;
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/stages/{id}": {
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/activities": {
    get: {
      parameters: {
        query: {
          kind?: string;
          assignee_id?: string;
          completed?: string;
          sort?: string;
          order?: string;
          page?: number;
          per_page?: number;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": {
              data: Record<string, unknown>[];
              meta: Record<string, unknown>;
            };
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            activity: Record<string, unknown>;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/activities/{id}": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      requestBody: {
        content: {
          "application/json": Record<string, unknown>;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/notes": {
    get: {
      parameters: {
        query: {
          notable_type?: string;
          notable_id?: string;
          page?: number;
          per_page?: number;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": {
              data: Record<string, unknown>[];
              meta: Record<string, unknown>;
            };
          };
        };
      };
    };
    post: {
      requestBody?: {
        content: {
          "application/json": {
            note: {
              body: string;
              notable_type: string;
              notable_id: string;
            };
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/notes/{id}": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/tags": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>[];
          };
        };
      };
    };
    post: {
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/tags/{id}": {
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/contacts/{contact_id}/tags": {
    get: {
      parameters: {
        path: {
          contact_id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>[];
          };
        };
      };
    };
    post: {
      parameters: {
        path: {
          contact_id: string;
        };
      };
      requestBody?: {
        content: {
          "application/json": {
            tag_id: string;
          };
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/contacts/{contact_id}/tags/{tag_id}": {
    delete: {
      parameters: {
        path: {
          contact_id: string;
          tag_id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/companies/{company_id}/tags": {
    get: {
      parameters: {
        path: {
          company_id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>[];
          };
        };
      };
    };
    post: {
      parameters: {
        path: {
          company_id: string;
        };
      };
      requestBody?: {
        content: {
          "application/json": {
            tag_id: string;
          };
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/companies/{company_id}/tags/{tag_id}": {
    delete: {
      parameters: {
        path: {
          company_id: string;
          tag_id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/deals/{deal_id}/tags": {
    get: {
      parameters: {
        path: {
          deal_id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>[];
          };
        };
      };
    };
    post: {
      parameters: {
        path: {
          deal_id: string;
        };
      };
      requestBody?: {
        content: {
          "application/json": {
            tag_id: string;
          };
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/deals/{deal_id}/tags/{tag_id}": {
    delete: {
      parameters: {
        path: {
          deal_id: string;
          tag_id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/custom_field_definitions": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>[];
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            custom_field_definition?: Record<string, unknown>;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/custom_field_definitions/{id}": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            custom_field_definition?: Record<string, unknown>;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/custom_object_definitions": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>[];
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            custom_object_definition?: Record<string, unknown>;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/custom_object_definitions/{id}": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            custom_object_definition?: Record<string, unknown>;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/custom_object_definitions/{custom_object_definition_id}/records": {
    get: {
      parameters: {
        path: {
          custom_object_definition_id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>[];
          };
        };
      };
    };
    post: {
      parameters: {
        path: {
          custom_object_definition_id: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            custom_object_record?: Record<string, unknown>;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/custom_object_records/{id}": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            custom_object_record?: Record<string, unknown>;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/plugins": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>[];
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            plugin?: Record<string, unknown>;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/plugins/{id}": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            plugin?: Record<string, unknown>;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/saved_views": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>[];
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            saved_view?: Record<string, unknown>;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/saved_views/{id}": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            saved_view?: Record<string, unknown>;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/automations": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": {
              data: Record<string, unknown>[];
              meta: Record<string, unknown>;
            };
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            automation: Record<string, unknown>;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/automations/templates": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>[];
          };
        };
      };
    };
  };
  "/emails": {
    get: {
      parameters: {
        query: {
          contact_id?: string;
          deal_id?: string;
          status?: string;
          page?: number;
          per_page?: number;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": {
              data: Record<string, unknown>[];
              meta: Record<string, unknown>;
            };
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            email: Record<string, unknown>;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/emails/{id}": {
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            email: Record<string, unknown>;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/email_settings": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    patch: {
      requestBody: {
        content: {
          "application/json": {
            email_setting: Record<string, unknown>;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/emails/{id}/redeliver": {
    post: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/automations/{id}": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            automation: Record<string, unknown>;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/automations/{id}/toggle": {
    post: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/automations/{id}/runs": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": {
              data: Record<string, unknown>[];
              meta: Record<string, unknown>;
            };
          };
        };
      };
    };
  };
  "/email_sequences": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": {
              data: Record<string, unknown>[];
              meta: Record<string, unknown>;
            };
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            email_sequence: Record<string, unknown>;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/email_sequences/{id}": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            email_sequence: Record<string, unknown>;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/email_sequences/{id}/enroll": {
    post: {
      parameters: {
        path: {
          id: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            contact_id?: string;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/email_sequences/{email_sequence_id}/steps": {
    get: {
      parameters: {
        path: {
          email_sequence_id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>[];
          };
        };
      };
    };
    post: {
      parameters: {
        path: {
          email_sequence_id: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            email_sequence_step: Record<string, unknown>;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/email_sequences/{email_sequence_id}/steps/{id}": {
    patch: {
      parameters: {
        path: {
          email_sequence_id: string;
          id: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            email_sequence_step: Record<string, unknown>;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          email_sequence_id: string;
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/email_sequences/{id}/enrollments": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": {
              data: Record<string, unknown>[];
              meta: Record<string, unknown>;
            };
          };
        };
      };
    };
  };
  "/sequence_enrollments/{id}": {
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/sequence_enrollments/{id}/unsubscribe": {
    post: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/unsubscribe": {
    post: {
      requestBody: {
        content: {
          "application/json": {
            token?: string;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/webhooks": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": {
              data: Record<string, unknown>[];
              meta: Record<string, unknown>;
            };
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            webhook: Record<string, unknown>;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/webhooks/{id}": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            webhook: Record<string, unknown>;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/webhooks/{id}/deliveries": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": {
              data: Record<string, unknown>[];
              meta: Record<string, unknown>;
            };
          };
        };
      };
    };
  };
  "/auth/signup": {
    post: {
      requestBody: {
        content: {
          "application/json": {
            user: Record<string, unknown>;
            account_name: string;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/auth/login": {
    post: {
      requestBody: {
        content: {
          "application/json": {
            email: string;
            password: string;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/auth/logout": {
    delete: {
      responses: {
        204: never;
      };
    };
  };
  "/auth/me": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/invitations": {
    post: {
      requestBody: {
        content: {
          "application/json": {
            invitation?: Record<string, unknown>;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/invitations/{token}/accept": {
    post: {
      parameters: {
        path: {
          token: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/memberships": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>[];
          };
        };
      };
    };
  };
  "/memberships/{id}": {
    patch: {
      parameters: {
        path: {
          id: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            role?: string;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/api_tokens": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>[];
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            api_token?: Record<string, unknown>;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/api_tokens/{id}": {
    delete: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        204: never;
      };
    };
  };
  "/import/csv": {
    post: {
      responses: {
        202: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/import/{id}": {
    get: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/export/csv/{type}": {
    get: {
      parameters: {
        path: {
          type: string;
        };
      };
      responses: {
        200: {
          content: {
            "text/csv": string;
          };
        };
      };
    };
  };
  "/contacts/{id}/score": {
    post: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/ai/settings": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
    patch: {
      requestBody: {
        content: {
          "application/json": {
            ai_setting: Record<string, unknown>;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
  "/ai/test_connection": {
    post: {
      responses: {
        200: {
          content: {
            "application/json": {
              success?: boolean;
              message?: string;
            };
          };
        };
      };
    };
  };
  "/ai/prompts": {
    post: {
      requestBody: {
        content: {
          "application/json": {
            kind?: string;
            message?: string;
            contact_id?: string;
            purpose?: string;
            deal_id?: string;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": {
              system_prompt?: string;
              user_prompt?: string;
            };
          };
        };
      };
    };
  };
  "/ai/chat": {
    post: {
      requestBody: {
        content: {
          "application/json": {
            message?: string;
            context?: unknown;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": {
              response?: string;
            };
          };
        };
      };
    };
  };
  "/emails/templates": {
    get: {
      parameters: {
        query: {
          contact_id?: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, unknown>[];
          };
        };
      };
    };
  };
  "/emails/deliver": {
    post: {
      requestBody: {
        content: {
          "application/json": {
            contact_id?: string;
            deal_id?: string;
            subject?: string;
            body?: string;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": Record<string, unknown>;
          };
        };
      };
    };
  };
}
export type components = Record<string, never>;
