---
title: 'Draft Post'
slug: draft-post
description: 'This post is a draft and should be excluded from the build'
publish_on: 2026-01-01
draft: true
tags:
  - draft
  - test
---

This is a draft blog post. Even though its `publish_on` date is in the past,
the `draft: true` flag means it should **never** appear in the build output.
