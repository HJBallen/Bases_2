-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.category (
  id integer NOT NULL DEFAULT nextval('"Category_id_seq"'::regclass),
  name character varying NOT NULL,
  description character varying NOT NULL,
  CONSTRAINT category_pkey PRIMARY KEY (id)
);
CREATE TABLE public.multimedia (
  id uuid NOT NULL,
  alt character varying NOT NULL,
  src text NOT NULL,
  id_product uuid NOT NULL,
  CONSTRAINT multimedia_pkey PRIMARY KEY (id),
  CONSTRAINT FK_Multimedia_Product FOREIGN KEY (id_product) REFERENCES public.product(id)
);
CREATE TABLE public.order (
  id integer NOT NULL DEFAULT nextval('"Order_id_seq"'::regclass),
  id_customer integer NOT NULL,
  id_payment uuid NOT NULL,
  state character varying NOT NULL,
  created_at date NOT NULL DEFAULT now(),
  CONSTRAINT order_pkey PRIMARY KEY (id),
  CONSTRAINT FK_Order_Payment FOREIGN KEY (id_payment) REFERENCES public.payment(id),
  CONSTRAINT FK_Order_User FOREIGN KEY (id_customer) REFERENCES public.user(id)
);
CREATE TABLE public.order_item (
  id integer NOT NULL DEFAULT nextval('"Order_item_id_seq"'::regclass),
  id_order integer NOT NULL,
  id_product uuid NOT NULL,
  quantity integer NOT NULL,
  total_price numeric NOT NULL,
  CONSTRAINT order_item_pkey PRIMARY KEY (id),
  CONSTRAINT FK_Order_item_Order FOREIGN KEY (id_order) REFERENCES public.order(id),
  CONSTRAINT FK_Order_item_Product FOREIGN KEY (id_product) REFERENCES public.product(id)
);
CREATE TABLE public.payment (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at character varying NOT NULL DEFAULT now(),
  status character varying,
  id_payment_method integer,
  mp_preference_id text,
  mp_payment_id text,
  CONSTRAINT payment_pkey PRIMARY KEY (id),
  CONSTRAINT FK_Payment_Payment_method FOREIGN KEY (id_payment_method) REFERENCES public.payment_method(id)
);
CREATE TABLE public.payment_method (
  id integer NOT NULL DEFAULT nextval('"Payment_method_id_seq"'::regclass),
  name character varying NOT NULL,
  description character varying NOT NULL,
  CONSTRAINT payment_method_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product (
  id uuid NOT NULL,
  name character varying NOT NULL,
  price numeric NOT NULL,
  created_at date NOT NULL DEFAULT now(),
  stock integer NOT NULL,
  id_vendor integer NOT NULL,
  features text,
  id_category integer NOT NULL,
  CONSTRAINT product_pkey PRIMARY KEY (id),
  CONSTRAINT FK_Product_Category FOREIGN KEY (id_category) REFERENCES public.category(id),
  CONSTRAINT product_id_vendor_fkey FOREIGN KEY (id_vendor) REFERENCES public.user(id)
);
CREATE TABLE public.rating (
  id integer NOT NULL DEFAULT nextval('"Rating_id_seq"'::regclass),
  id_customer integer,
  id_vendor integer,
  value character varying,
  date date,
  CONSTRAINT rating_pkey PRIMARY KEY (id),
  CONSTRAINT FK_Rating_User FOREIGN KEY (id_customer) REFERENCES public.user(id),
  CONSTRAINT FK_Rating_User_02 FOREIGN KEY (id_vendor) REFERENCES public.user(id)
);
CREATE TABLE public.role (
  id integer NOT NULL DEFAULT nextval('"Role_id_seq"'::regclass),
  name character varying,
  description character varying,
  CONSTRAINT role_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying,
  lastname character varying,
  cell character varying,
  email character varying,
  role_id integer,
  uuid uuid NOT NULL UNIQUE,
  CONSTRAINT user_pkey PRIMARY KEY (id),
  CONSTRAINT FK_User_Role FOREIGN KEY (role_id) REFERENCES public.role(id),
  CONSTRAINT user_uuid_fkey FOREIGN KEY (uuid) REFERENCES auth.users(id)
);