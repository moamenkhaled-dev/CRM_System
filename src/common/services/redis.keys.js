export const RedisKeys = {
  Auth: {
    RevokeTokenKey: ({ userId, jti }) => {
      return `Auth::RevokeToken::User::${userId}::JTI::${jti}`;
    },
  },

  RateLimit: {
    BaseEndPointKey: () => {
      return `RateLimit::EndPoint`;
    },
    UserEndPointKey: ({ userId, path }) => {
      return `${RedisKeys.RateLimit.BaseEndPointKey()}::User::${userId}::Path::${path}`;
    },
    IPEndPointKey: ({ ip, path }) => {
      return `${RedisKeys.RateLimit.BaseEndPointKey()}::IP::${ip}::Path::${path}`;
    },
  },

  User: {
    Profile: ({ userId }) => {
      return `User::Profile::${userId}`;
    },
  },

  Contact: {
    BaseSingle: ({ contactId }) => {
      return `Contact::Single::ID::${contactId}`;
    },
    single: ({ contactId, userId }) => {
      return `Contact::Single::ID::${contactId}::User${userId}`;
    },
    BaseList: ({ userId, role }) => {
      return `Contact::List::User::${userId || "all"}::Role::${role || "all"}`;
    },
    List: ({ userId, role, status, page, limit, search }) => {
      return `${RedisKeys.Contact.BaseList({ userId, role })}::Status::${status || "all"}::Page::${page || "all"}::Limit::${limit}::Search::${search || "all"}`;
    },
  },

  Deal: {
    BaseSingle: ({ dealId }) => {
      return `Deal::Single::Deal::${dealId}`;
    },
    SingleDeal: ({ dealId, userId }) => {
      return `${RedisKeys.Deal.BaseSingle({ dealId })}::User::${userId || "all"}`;
    },
    BaseList: ({ userId, role }) => {
      return `Deal::List::User::${userId || "all"}::Role::${role || "all"}`;
    },
    List: ({ userId, role, page, limit, search }) => {
      return `Deal::List::User::${userId || "all"}::Role::${role || "all"}::Page::${page || "all"}::Limit::${limit || 5}::Search::${search || "all"}`;
    },
  },

  Activity: {
    Version: {
      User: ({ userId = "all" }) => {
        return `Activity::List::User::${userId}::Version`;
      },
      Contact: ({ userId = "all", contactId }) => {
        return `Activity::List::User::${userId}::Contact::${contactId}::Version`;
      },
      Deal: ({ userId = "all", dealId }) => {
        return `Activity::List::User::${userId}::Deal::${dealId}::Version`;
      },
    },
    List: ({
      userId = "all",
      version,
      contactId = "all",
      dealId = "all",
      type = "all",
      outcome = "all",
    }) => {
      return `Activity::List::User::${userId}::V::${version}::Contact::${contactId}::Deal::${dealId}::Type::${type}::Outcome::${outcome}`;
    },
    Single: ({ activityId, userId, version }) => {
      return `Activity::Single::ID::${activityId}::User::${userId}::V::${version}`;
    },
  },

  Task: {
    Version: {
      Single: ({ taskId }) => {
        return `Task::Single::${taskId}::Version`;
      },
      List: ({ userId = "all" }) => {
        return `Task::List::User::${userId}::Version`;
      },
    },
    Single: ({ taskId, userId = "all", version }) => {
      return `Task::Single::${taskId}::V::${version}::User::${userId}`;
    },
    List: ({
      userId = "all",
      version,
      startDueDate = "all",
      endDueDate = "all",
      priority = "all",
      startCompletedDate = "all",
      endCompletedDate = "all",
      isCompleted = "all",
    }) => {
      return `Task::List::User::${userId}::V::${version}::StartDueDate::${startDueDate}::EndDueDate::${endDueDate}::Priority::${priority}::StartCompletedDate::${startCompletedDate}::EndCompletedDate::${endCompletedDate}::IsCompleted::${isCompleted}`;
    },
  },
};
