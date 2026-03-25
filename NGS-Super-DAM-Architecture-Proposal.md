# NGS Super — Enterprise DAM Architecture Proposal
## Adobe DAM Prime + Content Hub + Dynamic Media
### Solution Architect Validation & Recommended Structure

**Prepared for:** NGS Super (Superannuation Fund – Australia)  
**Date:** 18 March 2026  
**Version:** 1.0  

---

## 1. Executive Summary

After reviewing the client's **"DAM Mapped (1).xlsx"** workbook across all 7 sheets — Current Assets Mapping, Expected Folder Structure, MetaData Schemas, Governance Rules, DAM User Groups, Content Hub Groups, and Dynamic Media Requirements — this document provides:

1. **Validation of the current mapping** — identifying gaps, risks and anti-patterns
2. **Proposed enterprise-grade DAM folder structure** aligned with Adobe best practices
3. **Enhanced metadata schema** leveraging DAM Prime capabilities
4. **Governance, access control & workflow improvements**
5. **Content Hub & Dynamic Media optimization recommendations**

---

## 2. Validation of Current State

### 2.1 Current Assets Mapping — Issues Found

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| 1 | **Duplicate assets with different metadata** | 🔴 Critical | Same files (e.g., `insurance-guide.pdf`, `contribution-splitting.pdf`, `opportunities-and-limits.pdf`, `ngs-product-disclosure-statement.pdf`) appear multiple times with different Category 5 (Asset Type) values — "Form" vs "Insurance document" vs blank. This violates **single source of truth** principle. |
| 2 | **Inconsistent taxonomy** | 🔴 Critical | Category 5 values are inconsistent: "PDF", "Form", "Insurance document", blank. Tags field has inconsistent delimiters and values: "form", "forms", "form, forms", "document, insurance", "forms, insurance". |
| 3 | **Missing metadata on Image assets** | 🟡 High | ~80 image records have **completely blank metadata columns** (cols M–AI). No meta schema title, file type, tags, region, or any metadata is planned for images. This will make images unsearchable and ungovernable. |
| 4 | **URL-based folder structure** | 🟡 High | Assets are scattered across `/Files/Forms/Download/`, `/Files/documents/`, `/files/articles/banners/`, `/getmedia/`, `/getattachment/`, `/assets/images/graphics/` — **6+ different path patterns**. No consistent hierarchy. |
| 5 | **No version tracking** | 🟡 High | Files like `insurance-guide.pdf` exist at multiple URLs with no version indicator. |
| 6 | **Audience field poorly populated** | 🟠 Medium | Category 3 (Audience) is sporadically filled: "Super", "Insurance", "Fees and costs", "Investment", "Learn with NGS", "Super Tips", "2020" — these mix product, topic, and year. |
| 7 | **No campaign tracking for website assets** | 🟠 Medium | Campaign field (Category 4) is only populated for AJO/Email assets, not website assets. |
| 8 | **Division/Lifecycle unused** | 🟠 Medium | Categories 6 (Lifecycle) and 7 (Division) are blank across **all** records. |
| 9 | **AJO assets lack file references** | 🟠 Medium | Last 5 AJO records have no file names, URLs, or proper metadata — they're placeholders. |
| 10 | **Typos in folder names** | 🟢 Low | "Insruance" (should be Insurance), "Regulartory" (should be Regulatory), "Perfomance" (should be Performance). |

### 2.2 Expected Folder Structure — Issues Found

| # | Issue | Detail |
|---|-------|--------|
| 1 | **Only 3 levels deep maximum** | Real-world DAM needs 4–5 levels for proper organization. Structure is too shallow for scale. |
| 2 | **Channel-first taxonomy** | Structure starts with "Website" and "AJO" — this creates silos. The same image used on website AND email would be duplicated. |
| 3 | **No asset-type segregation** | Documents (PDF), Images (JPG/PNG), and Videos are all in the same folders. This defeats Dynamic Media optimization and rendition management. |
| 4 | **No brand/year/lifecycle dimension** | No structure for annual content (Annual Reports, PDS updates), no archive strategy. |
| 5 | **Missing major content categories** | No folders for: Brand Assets (logos, fonts, color palettes), Templates, Videos, Social Media, Print Materials, Internal Communications. |
| 6 | **News only has 2020** | No structure for other years or ongoing news content. |
| 7 | **No shared/global assets folder** | Common elements (logo, icons, infographics) have no dedicated home — they'll be buried. |

### 2.3 MetaData Schema — Issues Found

| # | Issue | Detail |
|---|-------|--------|
| 1 | **Mixed namespaces** | Uses `dc:`, `jcr:`, `dam:`, `acme:`, `cq:`, `prism:`, `tiff:` — the `acme:` namespace should be `ngssuper:` for the client's custom properties. |
| 2 | **No Channel metadata** | No field to track where an asset is published (Website, Email, Social, Print). |
| 3 | **No Rights Management** | No fields for usage rights, license type, copyright holder, or usage restrictions — critical for a regulated superannuation fund. |
| 4 | **No Accessibility fields** | Alt text is marked "Not Mandatory" — for WCAG compliance in financial services, this should be mandatory for all images. |
| 5 | **Review logic is good** | The Evergreen/Expiry/Review date logic is well-thought-out. Keep it. |
| 6 | **Missing AI/Smart tagging config** | Schema references "Smart Tags" but no configuration for Adobe Sensei auto-tagging is defined. |

### 2.4 Governance Rules — Validation

| # | Assessment | Detail |
|---|-----------|--------|
| ✅ | **Expiry workflow is excellent** | 90/60/30/7/1 day cascade is industry best practice. |
| ✅ | **Review workflow is solid** | Mirror of expiry workflow for review dates. |
| ✅ | **Maker/Checker approval** | Good for regulated financial services industry. |
| ⚠️ | **Bulk extend (60 days)** | Risky — could lead to indefinite extensions. Recommend a **maximum of 2 extensions** before mandatory review. |
| ⚠️ | **No download tracking** | No governance around who downloads what and when — needed for audit trails. |
| ⚠️ | **No watermarking rules** | Draft/unapproved assets should have watermarks. |

### 2.5 User Groups — Validation

| # | Assessment | Detail |
|---|-----------|--------|
| ✅ | **Asset Admins** | Full access — correct. |
| ✅ | **Folder-based permissions** | Good approach for DAM Prime. |
| ⚠️ | **Only 4 groups defined** | Need more granularity: Brand Team, Investment Team, External Agencies, Read-Only Stakeholders. |
| ⚠️ | **Content Hub groups are empty** | Content Hub user groups need to be defined to manage Brand Portal-like distribution. |
| 🔴 | **No External User group** | NGS Super likely works with agencies, photographers, etc. who need controlled upload access. |

---

## 3. Proposed Enterprise DAM Folder Structure

Based on Adobe DAM best practices: **Asset-Type First → Brand → Purpose → Topic → Lifecycle**

```
/content/dam/ngssuper/
│
├── 📁 brand-assets/                          ← Single source of truth for brand
│   ├── 📁 logos/
│   │   ├── 📁 primary/
│   │   ├── 📁 secondary/
│   │   └── 📁 partner-logos/
│   ├── 📁 color-palettes/
│   ├── 📁 fonts/
│   ├── 📁 brand-guidelines/
│   ├── 📁 icons/
│   └── 📁 templates/
│       ├── 📁 email-templates/
│       ├── 📁 social-templates/
│       └── 📁 document-templates/
│
├── 📁 documents/                              ← All PDFs, Word docs, spreadsheets
│   ├── 📁 forms/
│   │   ├── 📁 super/
│   │   │   ├── 📁 contributions/             ← salary-sacrifice.pdf, split-super, etc.
│   │   │   ├── 📁 withdrawals/              ← request-for-withdrawal, etc.
│   │   │   ├── 📁 transfers/                ← transfer-authority.pdf
│   │   │   └── 📁 tax/                      ← notice-of-intent, providing-tfn, etc.
│   │   ├── 📁 insurance/
│   │   │   ├── 📁 claims/                   ← death-claim, terminal-illness, etc.
│   │   │   ├── 📁 variations/               ← increase, reduction, change forms
│   │   │   └── 📁 nominations/              ← beneficiary nomination forms
│   │   ├── 📁 retirement/
│   │   │   ├── 📁 income-stream/
│   │   │   └── 📁 pension/
│   │   └── 📁 employer/
│   │       └── 📁 payroll/
│   │
│   ├── 📁 product-disclosure/                 ← PDS documents
│   │   ├── 📁 current/                       ← Only latest versions
│   │   └── 📁 archive/                       ← Previous versions (by FY)
│   │       ├── 📁 fy-2024-25/
│   │       └── 📁 fy-2023-24/
│   │
│   ├── 📁 guides/
│   │   ├── 📁 member-guides/
│   │   │   ├── 📁 insurance/
│   │   │   ├── 📁 investment/
│   │   │   └── 📁 super/
│   │   └── 📁 employer-guides/
│   │
│   ├── 📁 annual-reports/
│   │   ├── 📁 fy-2024-25/
│   │   └── 📁 fy-2023-24/
│   │
│   ├── 📁 policies/
│   │   ├── 📁 investment-policies/
│   │   ├── 📁 governance-policies/
│   │   └── 📁 privacy-policies/
│   │
│   └── 📁 regulatory/
│       ├── 📁 significant-event-notices/
│       ├── 📁 target-market-determinations/
│       └── 📁 compliance/
│
├── 📁 images/                                 ← All images (Dynamic Media enabled)
│   ├── 📁 hero-banners/
│   │   ├── 📁 homepage/
│   │   ├── 📁 landing-pages/
│   │   └── 📁 campaign/
│   │
│   ├── 📁 article-banners/
│   │   ├── 📁 super-tips/
│   │   ├── 📁 investment/
│   │   ├── 📁 general/
│   │   ├── 📁 preparing-to-retire/
│   │   ├── 📁 people/
│   │   └── 📁 news/
│   │       └── 📁 {year}/                    ← 2024, 2025, 2026...
│   │
│   ├── 📁 education/
│   │   └── 📁 learn-with-ngs/               ← Money Coach images
│   │
│   ├── 📁 infographics/
│   │   ├── 📁 service-promise/
│   │   ├── 📁 fund-performance/
│   │   └── 📁 investment-charts/
│   │
│   ├── 📁 awards-badges/                     ← Chant West, Rainmaker, Money Mag, etc.
│   │
│   ├── 📁 team-photos/
│   │   ├── 📁 leadership/
│   │   └── 📁 advisors/
│   │
│   ├── 📁 sdg-icons/                         ← UN SDG icons for investment stories
│   │
│   ├── 📁 ui-elements/                       ← Buttons, CTAs, decorative elements
│   │   ├── 📁 icons/
│   │   ├── 📁 buttons/
│   │   └── 📁 decorative/
│   │
│   └── 📁 stock-photography/
│       ├── 📁 lifestyle/
│       └── 📁 workplace/
│
├── 📁 video/                                  ← Future-proofing
│   ├── 📁 webinars/
│   ├── 📁 member-education/
│   ├── 📁 corporate/
│   └── 📁 social-media/
│
├── 📁 campaigns/                              ← Campaign-specific assets (cross-format)
│   ├── 📁 email/
│   │   ├── 📁 marketing/
│   │   │   ├── 📁 engagement/
│   │   │   │   └── 📁 younger-members/
│   │   │   ├── 📁 acquisition-retention/
│   │   │   │   └── 📁 performance-plus/
│   │   │   └── 📁 eofy/
│   │   └── 📁 regulatory/
│   │       └── 📁 significant-event-notices/
│   │
│   ├── 📁 social-media/
│   │   ├── 📁 facebook/
│   │   ├── 📁 linkedin/
│   │   └── 📁 instagram/
│   │
│   └── 📁 print/
│       ├── 📁 brochures/
│       └── 📁 event-materials/
│
└── 📁 _archive/                               ← Soft-deleted/retired assets
    ├── 📁 fy-2023-24/
    └── 📁 fy-2024-25/
```

### Why This Structure Is Better

| Principle | Client's Original | Proposed |
|-----------|-------------------|----------|
| **Single Source of Truth** | Same PDF duplicated under Forms AND Guides with different metadata | One asset, one location. Use **AEM Tags + Collections** to surface in multiple contexts |
| **Asset-Type First** | Mixed documents and images in same folders | Separated by type → enables Dynamic Media for images, rendition policies per type |
| **Scalability** | 3 levels, 16 columns for expansion | 4–5 levels, clean expansion per year/topic |
| **Search & Discovery** | Relies on folder browsing | Metadata + Smart Tags + Collections = faceted search |
| **Dynamic Media** | No separation of media types | `/images/` folder = Dynamic Media enabled; `/documents/` = standard DAM |
| **Compliance** | No archive strategy | `/archive/` + versioned PDS folders = audit trail |
| **Reusability** | Logo in 242 pages, no central location | `/brand-assets/logos/` = one file, referenced everywhere |

---

## 4. Enhanced Metadata Schema

### 4.1 Core Metadata (All Assets)

| Field Label | Property Name | Type | Mandatory | Source | Notes |
|-------------|--------------|------|-----------|--------|-------|
| Title | `dc:title` | Text | Yes | Manual | — |
| Description | `dc:description` | Text | Yes (Images: No) | Manual | SEO + accessibility |
| Asset ID | `jcr:uuid` | Text | Auto | System | — |
| File Type | `dc:format` | Dropdown | Auto | System | MIME type |
| File Size | `dam:size` | Number | Auto | System | Bytes |
| Associated Brand | `ngssuper:brand` | Dropdown | Yes | Manual | "NGS Super" |
| Tags | `cq:tags` | Tag Picker | Yes | Manual + Sensei | Controlled taxonomy |
| Location/Region | `ngssuper:region` | Dropdown | Yes | Manual | AU, NZ, Global |
| Date Created | `jcr:created` | Date | Auto | System | — |
| Date Modified | `jcr:lastModified` | Date | Auto | System | — |
| Is Evergreen | `ngssuper:isEvergreen` | Boolean | Yes | Manual | Skips review cycle |
| Expiry Date | `prism:expirationDate` | Date | Conditional | Manual | Required if NOT evergreen |
| Next Review Date | `ngssuper:reviewDate` | Date | Conditional | Manual | Required if NOT evergreen |
| Content Owner Group | `ngssuper:ownerGroup` | Dropdown | Yes | Manual | Linked to DAM groups |
| Asset Status | `dam:status` | Dropdown | Yes | Workflow | Draft → In Review → Approved → Published → Expired → Archived |

### 4.2 Document-Specific Metadata

| Field Label | Property Name | Type | Mandatory | Notes |
|-------------|--------------|------|-----------|-------|
| Document Category | `ngssuper:docCategory` | Dropdown | Yes | Form, Guide, PDS, Policy, Report, SEN |
| Document Sub-Category | `ngssuper:docSubCategory` | Dropdown | Yes | Super, Insurance, Investment, Retirement, Employer, Tax |
| Financial Year | `ngssuper:financialYear` | Dropdown | Yes | FY2024-25, FY2025-26 etc. |
| Regulatory Classification | `ngssuper:regulatoryClass` | Dropdown | No | APRA-regulated, ASIC-required, Voluntary |
| Document Version | `ngssuper:docVersion` | Text | No | e.g., "v2.1" (separate from DAM versioning) |
| Target Audience | `ngssuper:audience` | Multi-Select | No | Members, Employers, Prospective Members, Advisors |

### 4.3 Image-Specific Metadata (Critical — Currently Missing!)

| Field Label | Property Name | Type | Mandatory | Notes |
|-------------|--------------|------|-----------|-------|
| Alt Text | `ngssuper:altText` | Text | **Yes** | WCAG mandatory for financial services |
| Image Purpose | `ngssuper:imagePurpose` | Dropdown | Yes | Hero Banner, Article Thumbnail, Infographic, Icon, Logo, UI Element, Photo |
| Intended Display Size | `ngssuper:displaySize` | Dropdown | No | Desktop, Mobile, Both |
| Dynamic Media Profile | `ngssuper:dmProfile` | Dropdown | Auto | Assigned by folder rules |
| Image Dimensions | `tiff:ImageWidth` / `tiff:ImageLength` | Auto | Auto | — |
| Color Space | `tiff:PhotometricInterpretation` | Auto | Auto | RGB, CMYK |
| **Usage Rights** | `ngssuper:usageRights` | Dropdown | **Yes** | Owned, Licensed-Limited, Licensed-Unlimited, Stock, Creative-Commons |
| License Expiry | `ngssuper:licenseExpiry` | Date | Conditional | Required if Licensed |
| Copyright Holder | `dc:rights` | Text | Conditional | Required if not Owned |

### 4.4 Campaign-Specific Metadata

| Field Label | Property Name | Type | Mandatory | Notes |
|-------------|--------------|------|-----------|-------|
| Campaign Name | `ngssuper:campaignName` | Text | Yes (in /campaigns/) | — |
| Campaign Type | `ngssuper:campaignType` | Dropdown | Yes | Marketing, Regulatory, Engagement, Acquisition |
| Channel | `ngssuper:channel` | Multi-Select | Yes | Website, Email, Social, Print, App |
| Target Segment | `ngssuper:targetSegment` | Multi-Select | No | Younger, Pre-Retiree, Employer, etc. |
| Campaign Start Date | `ngssuper:campaignStart` | Date | No | — |
| Campaign End Date | `ngssuper:campaignEnd` | Date | No | — |

---

## 5. Controlled Taxonomy (Tag Hierarchy)

Replace the current inconsistent free-text tags with a controlled taxonomy:

```
/content/cq:tags/ngssuper/
│
├── product/
│   ├── superannuation
│   ├── income-account
│   ├── retirement
│   ├── insurance
│   │   ├── death-cover
│   │   ├── tpd
│   │   ├── income-protection
│   │   └── salary-continuance
│   └── investment
│       ├── diversified-mysuper
│       ├── high-growth
│       ├── balanced
│       ├── defensive
│       └── (all other options)
│
├── topic/
│   ├── contributions
│   ├── fees-and-costs
│   ├── tax
│   ├── beneficiaries
│   ├── withdrawals
│   ├── transfers
│   ├── salary-sacrifice
│   ├── employer-obligations
│   ├── financial-planning
│   ├── retirement-planning
│   └── esg-responsible-investing
│
├── audience/
│   ├── members
│   ├── employers
│   ├── prospective-members
│   ├── financial-advisors
│   └── young-members
│
├── content-type/
│   ├── form
│   ├── guide
│   ├── pds
│   ├── fact-sheet
│   ├── annual-report
│   ├── policy
│   ├── article
│   ├── news
│   ├── infographic
│   └── photo
│
├── channel/
│   ├── website
│   ├── email
│   ├── social-media
│   ├── print
│   └── app
│
└── compliance/
    ├── apra-regulated
    ├── asic-required
    ├── sen (significant-event-notice)
    └── tmd (target-market-determination)
```

---

## 6. Governance Enhancements

### 6.1 Keep (Already Good)
- ✅ 90/60/30/7/1 day expiry notification cascade
- ✅ Identical cascade for review dates
- ✅ Maker/checker approval workflow
- ✅ Content owner group-based folder permissions

### 6.2 Add These Rules

| Rule | Description | Rationale |
|------|-------------|-----------|
| **Max 2 Bulk Extensions** | After 2 × 60-day extensions, asset MUST go through full review | Prevents indefinite deferral |
| **Mandatory Metadata Validation** | Assets cannot be published without all mandatory fields filled | Prevents orphan/ungovernable assets |
| **Download Audit Trail** | Log all downloads with user, timestamp, purpose | APRA/ASIC compliance audit trail |
| **Watermark on Draft** | All assets in "Draft" or "In Review" status get auto-watermark overlay | Prevents unapproved content use |
| **Duplicate Detection** | On upload, check for file hash matches and warn | Eliminates the duplication problem seen in current mapping |
| **Auto-Archive on Expiry** | Assets 90 days past expiry are auto-moved to `/_archive/` | Keeps active DAM clean |
| **Annual PDS Rotation** | When new PDS uploaded to `/current/`, old one auto-moves to `/archive/fy-XXXX/` | Regulatory compliance |
| **Smart Crop Auto-Apply** | Images in `/images/` auto-receive Dynamic Media Smart Crop profiles | Ensures responsive renditions |

### 6.3 Approval Workflow (Enhanced)

```
Upload → Auto-Metadata Validation → Draft
    ↓
Creator fills metadata → Submits for Review
    ↓
Content Owner Group notified → Reviewer checks
    ↓ (if approved)                    ↓ (if rejected)
Published + Notification          Creator notified with comments
    ↓                                   ↓
Live (with expiry/review dates)   Creator edits → Re-submits
```

---

## 7. User Groups & Access Control (Enhanced)

| Group | ID | Folders (Write) | Folders (Read) | Capabilities |
|-------|----|-----------------|----------------|--------------|
| **DAM Administrators** | TBC | All `/content/dam/ngssuper/` | All | Full CRUD, Group mgmt, Schema mgmt, Workflow config |
| **Marketing Team** | TBC | `/images/hero-banners/`, `/images/article-banners/`, `/campaigns/email/marketing/`, `/campaigns/social-media/` | All | Upload, Edit metadata, Submit for approval |
| **Legal & Compliance** | TBC | `/documents/forms/`, `/documents/guides/`, `/documents/regulatory/`, `/documents/policies/` | All | Upload, Edit metadata, Submit for approval |
| **Regulatory Team** | TBC | `/documents/product-disclosure/`, `/documents/regulatory/`, `/campaigns/email/regulatory/` | All | Upload, Edit metadata, Submit for approval |
| **Investment Team** | TBC | `/documents/policies/investment-policies/`, `/images/infographics/investment-charts/` | All | Upload, Edit metadata, Submit for approval |
| **Brand Custodians** | TBC | `/brand-assets/` | All | Upload, Edit metadata, Submit for approval, Approve brand assets |
| **External Agencies** | TBC | `/campaigns/{assigned-campaign}/` | `/brand-assets/` (read-only) | Upload to assigned campaign folder only, Download brand assets |
| **Read-Only Stakeholders** | TBC | None | All | View, Download, Search |

### Content Hub Distribution Groups

| Group | Purpose | Access |
|-------|---------|--------|
| **CH – Marketing** | Self-service access to approved marketing assets | Browse, Search, Download approved assets from `/images/`, `/brand-assets/` |
| **CH – Employer Partners** | Employer-facing materials | Browse, Download from `/documents/employer/`, `/brand-assets/logos/` |
| **CH – External Agencies** | Brand assets + campaign briefs | Browse, Download from `/brand-assets/`, Upload to assigned collections |
| **CH – Board & Executives** | Annual reports, fund performance | Browse, Download from `/documents/annual-reports/`, `/images/infographics/` |

---

## 8. Dynamic Media Configuration

### 8.1 Image Profiles (Auto-Applied by Folder)

| Profile Name | Applied To Folder | Crops/Renditions |
|--------------|-------------------|------------------|
| **Hero Banner** | `/images/hero-banners/` | Desktop: 1440×600, Tablet: 1024×400, Mobile: 375×300 |
| **Article Thumbnail** | `/images/article-banners/` | Large: 767×576, Small: 384×288, Card: 300×200 |
| **Infographic** | `/images/infographics/` | Full: original AR, Half: 50%, Thumb: 200px wide |
| **Icon/Badge** | `/images/awards-badges/`, `/images/ui-elements/icons/` | 1x: 64×64, 2x: 128×128, 3x: 192×192 |
| **Team Photo** | `/images/team-photos/` | Portrait: 400×500, Square: 300×300, Thumb: 100×100 |
| **Email Header** | `/campaigns/email/` | Email Banner: 700×200, Mobile Email: 375×150 |
| **Social Media** | `/campaigns/social-media/` | Instagram: 1080×1080, LinkedIn: 1200×628, Facebook: 940×788 |

### 8.2 Smart Crop Configuration
Enable **Adobe Sensei Smart Crop** on all image folders with:
- Person detection for team photos
- Subject detection for article banners
- Edge-aware cropping for infographics

### 8.3 Video Profiles (Future)
| Profile | Applied To | Output |
|---------|-----------|--------|
| **Webinar** | `/video/webinars/` | MP4: 1080p, 720p, 480p + HLS adaptive |
| **Social Clip** | `/video/social-media/` | MP4: Square 1080×1080, Vertical 1080×1920 |

---

## 9. Migration Strategy

### Phase 1 — Foundation (Weeks 1–4)
1. Create folder structure in AEM DAM
2. Configure metadata schemas (forms)
3. Set up controlled taxonomy tags
4. Configure user groups & permissions
5. Set up Dynamic Media image profiles

### Phase 2 — Content Migration (Weeks 5–8)
1. **De-duplicate** — Identify the 138 assets and reduce to unique set (~80–90 estimated)
2. **Enrich metadata** — Fill missing metadata for ALL assets (especially images)
3. **Migrate documents** → `/documents/` hierarchy
4. **Migrate images** → `/images/` hierarchy with proper metadata
5. **Validate** — Run completeness check

### Phase 3 — Workflows & Governance (Weeks 9–10)
1. Deploy approval workflows
2. Deploy expiry/review notification workflows
3. Test bulk extend/deactivate actions
4. User acceptance testing with all groups

### Phase 4 — Content Hub & Dynamic Media (Weeks 11–12)
1. Configure Content Hub collections for each distribution group
2. Enable Dynamic Media profiles per folder
3. Configure Smart Crop
4. Test rendition delivery
5. Go-live

---

## 10. Key Recommendations Summary

| # | Recommendation | Priority |
|---|---------------|----------|
| 1 | **De-duplicate assets immediately** — same file should exist once with tags for multiple contexts | 🔴 P0 |
| 2 | **Add metadata for ALL images** — currently 80+ images have zero metadata | 🔴 P0 |
| 3 | **Switch to asset-type-first folder structure** — not channel-first | 🔴 P0 |
| 4 | **Implement controlled taxonomy** — replace free-text tags with tag picker | 🟡 P1 |
| 5 | **Add usage rights/licensing metadata** — critical for regulated financial services | 🟡 P1 |
| 6 | **Make alt text mandatory for images** — WCAG compliance | 🟡 P1 |
| 7 | **Define Content Hub groups** — currently blank in workbook | 🟡 P1 |
| 8 | **Define Dynamic Media image profiles** — currently only placeholder in workbook | 🟡 P1 |
| 9 | **Add external agency user group** — for controlled partner access | 🟠 P2 |
| 10 | **Add download audit trail** — APRA/ASIC compliance readiness | 🟠 P2 |
| 11 | **Fix typos** — "Insruance", "Regulartory", "Perfomance" | 🟢 P3 |
| 12 | **Future-proof with video folders** — even if not used today | 🟢 P3 |

---

## 11. Adobe DAM Best Practices Checklist

| Best Practice | Current State | Proposed State |
|--------------|---------------|----------------|
| ☐ Max 5 folder levels | ✅ 3 levels | ✅ 4–5 levels |
| ☐ Asset-type separation | ❌ Mixed | ✅ Documents / Images / Video |
| ☐ Controlled metadata | ⚠️ Partial | ✅ Full schema with validation |
| ☐ Smart Tags enabled | ❌ Not configured | ✅ Adobe Sensei auto-tagging |
| ☐ Single source of truth | ❌ Duplicates exist | ✅ Collections for multi-context |
| ☐ Dynamic Media profiles | ❌ Not configured | ✅ Per-folder image profiles |
| ☐ Approval workflow | ✅ Maker/Checker | ✅ Enhanced with metadata validation |
| ☐ Expiry management | ✅ Good cascade | ✅ + Max extensions + auto-archive |
| ☐ RBAC (Role-Based Access) | ⚠️ 4 groups | ✅ 8 groups + Content Hub groups |
| ☐ Audit trail | ❌ None | ✅ Download + access logging |
| ☐ Brand governance | ❌ No brand folder | ✅ Dedicated brand-assets with custodians |
| ☐ Archive strategy | ❌ None | ✅ FY-based archive + auto-move |
| ☐ Accessibility (WCAG) | ❌ Alt text optional | ✅ Alt text mandatory for images |
| ☐ Rights management | ❌ None | ✅ Usage rights + license tracking |

---

*This proposal is designed to provide NGS Super with a DAM implementation that is scalable, compliant, searchable, and manageable — leveraging the full power of Adobe DAM Prime, Content Hub, and Dynamic Media.*
