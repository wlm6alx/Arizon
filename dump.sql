--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ApprovisionnementStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ApprovisionnementStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'RECEIVED',
    'REJECTED',
    'CANCELLED'
);


ALTER TYPE public."ApprovisionnementStatus" OWNER TO postgres;

--
-- Name: DeliveryStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DeliveryStatus" AS ENUM (
    'ASSIGNED',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'FAILED',
    'RETURNED'
);


ALTER TYPE public."DeliveryStatus" OWNER TO postgres;

--
-- Name: EmailStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EmailStatus" AS ENUM (
    'PENDING',
    'SENT',
    'FAILED',
    'BOUNCED'
);


ALTER TYPE public."EmailStatus" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'ORDER_UPDATE',
    'DELIVERY_UPDATE',
    'PAYMENT_UPDATE',
    'SYSTEM_ALERT',
    'PROMOTION'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'READY',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'CARD',
    'BANK_TRANSFER',
    'MOBILE_MONEY',
    'CRYPTO'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REFUNDED',
    'CANCELLED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: RoleType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RoleType" AS ENUM (
    'ADMIN',
    'BUSINESS',
    'SUPPLIER',
    'STOCK_MANAGER',
    'CLIENT',
    'COMMAND_MANAGER',
    'DELIVERY_DRIVER'
);


ALTER TYPE public."RoleType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: approvisionnements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.approvisionnements (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    "productId" text NOT NULL,
    "warehouseId" text NOT NULL,
    quantity numeric(10,2) NOT NULL,
    "proposedPrice" numeric(10,2) NOT NULL,
    "deliveryDate" date NOT NULL,
    status public."ApprovisionnementStatus" DEFAULT 'PENDING'::public."ApprovisionnementStatus" NOT NULL,
    "businessDeveloperId" text,
    "stockManagerId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.approvisionnements OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    color text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: deliveries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deliveries (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "driverId" text,
    status public."DeliveryStatus" DEFAULT 'ASSIGNED'::public."DeliveryStatus" NOT NULL,
    "gpsCoordinates" text,
    eta timestamp(3) without time zone,
    "deliveryDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.deliveries OWNER TO postgres;

--
-- Name: email_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_logs (
    id text NOT NULL,
    "to" text NOT NULL,
    "from" text NOT NULL,
    subject text NOT NULL,
    "templateId" text,
    status public."EmailStatus" DEFAULT 'PENDING'::public."EmailStatus" NOT NULL,
    error text,
    "sentAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.email_logs OWNER TO postgres;

--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_templates (
    id text NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    "htmlContent" text NOT NULL,
    "textContent" text,
    variables jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.email_templates OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    type public."NotificationType" NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "orderId" text,
    "deliveryId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    quantity numeric(10,2) NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "clientId" text NOT NULL,
    "warehouseId" text NOT NULL,
    "orderDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "deliveryOption" boolean DEFAULT false NOT NULL,
    "deliveryAddress" text,
    "paymentMethod" public."PaymentMethod" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "orderId" text,
    "approvisionnementId" text,
    amount numeric(10,2) NOT NULL,
    "paymentMethod" public."PaymentMethod" NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "transactionId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    name text NOT NULL,
    resource text NOT NULL,
    action text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: post_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_categories (
    id text NOT NULL,
    "postId" text NOT NULL,
    "categoryId" text NOT NULL
);


ALTER TABLE public.post_categories OWNER TO postgres;

--
-- Name: post_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_tags (
    id text NOT NULL,
    "postId" text NOT NULL,
    "tagId" text NOT NULL
);


ALTER TABLE public.post_tags OWNER TO postgres;

--
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id text NOT NULL,
    title text NOT NULL,
    content text,
    excerpt text,
    slug text NOT NULL,
    published boolean DEFAULT false NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    "metaTitle" text,
    "metaDescription" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "authorId" text NOT NULL
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_categories (
    id text NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_categories OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id text NOT NULL,
    "categoryId" text,
    name character varying(100) NOT NULL,
    description text,
    unit character varying(20) NOT NULL,
    "imageUrl" character varying(255),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    id text NOT NULL,
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL,
    "isGranted" boolean DEFAULT true NOT NULL,
    conditions jsonb
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id text NOT NULL,
    name text NOT NULL,
    type public."RoleType" NOT NULL,
    description text,
    color text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: stocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stocks (
    id text NOT NULL,
    "productId" text NOT NULL,
    "warehouseId" text NOT NULL,
    quantity numeric(10,2) NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "approvisionnementId" text,
    "lastUpdated" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.stocks OWNER TO postgres;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    color text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id text NOT NULL,
    "userId" text NOT NULL,
    "roleId" text NOT NULL,
    "assignedBy" text,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    username text,
    "firstName" text,
    "lastName" text,
    avatar text,
    phone text,
    password text NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    "emailVerificationToken" text,
    "emailVerificationExpires" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    bio text,
    address text,
    city text,
    country text,
    timezone text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lastLoginAt" timestamp(3) without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouses (
    id text NOT NULL,
    name character varying(100) NOT NULL,
    address text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.warehouses OWNER TO postgres;

--
-- Name: approvisionnements approvisionnements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approvisionnements
    ADD CONSTRAINT approvisionnements_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: deliveries deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_pkey PRIMARY KEY (id);


--
-- Name: email_logs email_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: post_categories post_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_categories
    ADD CONSTRAINT post_categories_pkey PRIMARY KEY (id);


--
-- Name: post_tags post_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT post_tags_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: stocks stocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT stocks_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: deliveries_orderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "deliveries_orderId_key" ON public.deliveries USING btree ("orderId");


--
-- Name: email_templates_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX email_templates_name_key ON public.email_templates USING btree (name);


--
-- Name: payments_transactionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "payments_transactionId_key" ON public.payments USING btree ("transactionId");


--
-- Name: permissions_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permissions_name_key ON public.permissions USING btree (name);


--
-- Name: permissions_resource_action_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permissions_resource_action_key ON public.permissions USING btree (resource, action);


--
-- Name: post_categories_postId_categoryId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "post_categories_postId_categoryId_key" ON public.post_categories USING btree ("postId", "categoryId");


--
-- Name: post_tags_postId_tagId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "post_tags_postId_tagId_key" ON public.post_tags USING btree ("postId", "tagId");


--
-- Name: posts_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX posts_slug_key ON public.posts USING btree (slug);


--
-- Name: product_categories_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_categories_name_key ON public.product_categories USING btree (name);


--
-- Name: role_permissions_roleId_permissionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON public.role_permissions USING btree ("roleId", "permissionId");


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: roles_type_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_type_key ON public.roles USING btree (type);


--
-- Name: sessions_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sessions_token_key ON public.sessions USING btree (token);


--
-- Name: stocks_productId_warehouseId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "stocks_productId_warehouseId_key" ON public.stocks USING btree ("productId", "warehouseId");


--
-- Name: tags_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);


--
-- Name: tags_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tags_slug_key ON public.tags USING btree (slug);


--
-- Name: user_roles_userId_roleId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON public.user_roles USING btree ("userId", "roleId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: approvisionnements approvisionnements_businessDeveloperId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approvisionnements
    ADD CONSTRAINT "approvisionnements_businessDeveloperId_fkey" FOREIGN KEY ("businessDeveloperId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: approvisionnements approvisionnements_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approvisionnements
    ADD CONSTRAINT "approvisionnements_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: approvisionnements approvisionnements_stockManagerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approvisionnements
    ADD CONSTRAINT "approvisionnements_stockManagerId_fkey" FOREIGN KEY ("stockManagerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: approvisionnements approvisionnements_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approvisionnements
    ADD CONSTRAINT "approvisionnements_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: approvisionnements approvisionnements_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approvisionnements
    ADD CONSTRAINT "approvisionnements_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: deliveries deliveries_driverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT "deliveries_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: deliveries deliveries_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT "deliveries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_deliveryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES public.deliveries(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notifications notifications_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_approvisionnementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_approvisionnementId_fkey" FOREIGN KEY ("approvisionnementId") REFERENCES public.approvisionnements(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: post_categories post_categories_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_categories
    ADD CONSTRAINT "post_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: post_categories post_categories_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_categories
    ADD CONSTRAINT "post_categories_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: post_tags post_tags_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT "post_tags_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: post_tags post_tags_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT "post_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: posts posts_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.product_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: role_permissions role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stocks stocks_approvisionnementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT "stocks_approvisionnementId_fkey" FOREIGN KEY ("approvisionnementId") REFERENCES public.approvisionnements(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stocks stocks_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT "stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stocks stocks_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT "stocks_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_roles user_roles_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

