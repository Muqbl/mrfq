# Page Linkage and Operational Data Flow

| Page | Input | Output | Consumed By | Module | Facility Link | Status |
|---|---|---|---|---|---|---|
| Employee portal | Service, details, space, photos/items | Request/order | Worker, supervisor, manager | All operational | Location mapped to Space | Operational |
| Worker app | Assigned task, evidence, notes | Status and report | Supervisor dashboard | Cleaning/Maintenance/Hospitality | Space inherited from request | Operational |
| Supervisor dashboard | Queue, team, SLA | Assignment and verification | Manager reports | Module scoped | Space and heat score | Operational |
| Module manager | Module metrics and team | Operational decisions | Facility manager | One module | Summarized by space | Operational |
| Facility manager | Cross-module requests, SLA, heatmap | Executive view | Leadership | Cross-module | Facility hierarchy | Operational foundation |
| System admin | Users, modules, settings, registry | Platform configuration | All modules | Platform | Manages hierarchy | Operational |
| Facilities & Spaces | Hierarchy and activity | Space overview/heat score | Admin and facility manager | Cross-module | Native | Operational foundation |
| Planned module page | Registry scope/status | Roadmap context only | Admin and facility manager | Planned | Future native link | Planned |
